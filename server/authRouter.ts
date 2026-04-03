import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from './db';
import { users, userProfiles, userSettings, verificationCodes } from '../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import superjson from 'superjson';
import bcrypt from 'bcryptjs';
import { sdk } from './_core/sdk';
import { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';
import { getSessionCookieOptions } from './_core/cookies';
import { sendVerificationEmail, sendPasswordResetEmail } from './email';

// Re-defining context type or importing it
interface Context {
  user?: { id: number; email: string; name: string };
  req: any;
  res: any;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const authRouter = t.router({
  me: t.procedure.query(async ({ ctx }) => {
    return ctx.user || null;
  }),

  login: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [user] = await db.select().from(users).where(eq(users.email, input.email));
      if (!user || !user.password) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid email or password' });
      }

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.username || user.email || "User",
        expiresInMs: ONE_YEAR_MS
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true };
    }),

  sendVerificationCode: t.procedure
    .input(z.object({ email: z.string().email(), name: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      // Check if user already exists
      const [existing] = await db.select().from(users).where(eq(users.email, input.email));
      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email already registered' });
      }

      // Generate 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      const passwordHash = await bcrypt.hash(input.password, 10);

      // Store in verificationCodes
      await db.insert(verificationCodes).values({
        email: input.email,
        code: pin,
        type: 'signup',
        name: input.name,
        passwordHash: passwordHash,
        expiresAt: expiresAt.toISOString(),
      });

      // Send email
      await sendVerificationEmail(input.email, pin);

      return { success: true };
    }),

  registerWithCode: t.procedure
    .input(z.object({ email: z.string().email(), code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [record] = await db.select().from(verificationCodes).where(and(
        eq(verificationCodes.email, input.email),
        eq(verificationCodes.code, input.code),
        eq(verificationCodes.type, 'signup'),
        gt(verificationCodes.expiresAt, new Date().toISOString())
      ));

      if (!record) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired code' });
      }

      // Create user
      const openId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const [user] = await db.insert(users).values({
        openId,
        email: input.email,
        name: record.name,
        username: input.email.split('@')[0] + Math.random().toString(36).substring(2, 5),
        password: record.passwordHash,
        loginMethod: 'email',
        lastSignedIn: new Date().toISOString()
      }).returning();

      // Initialize profile and settings
      await db.insert(userProfiles).values({ userId: user.id });
      await db.insert(userSettings).values({ userId: user.id });

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email || "User",
        expiresInMs: ONE_YEAR_MS
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Clean up codes
      await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));

      return { success: true };
    }),

  requestPasswordReset: t.procedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const [user] = await db.select().from(users).where(eq(users.email, input.email));
      if (!user) {
        // Silent fail to prevent email enumeration, but here we want to be helpful for the user
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await db.insert(verificationCodes).values({
        email: input.email,
        code: pin,
        type: 'reset',
        expiresAt: expiresAt.toISOString(),
      });

      await sendPasswordResetEmail(input.email, pin);

      return { success: true };
    }),

  resetPassword: t.procedure
    .input(z.object({ email: z.string().email(), code: z.string(), newPassword: z.string() }))
    .mutation(async ({ input }) => {
      const [record] = await db.select().from(verificationCodes).where(and(
        eq(verificationCodes.email, input.email),
        eq(verificationCodes.code, input.code),
        eq(verificationCodes.type, 'reset'),
        gt(verificationCodes.expiresAt, new Date().toISOString())
      ));

      if (!record) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired code' });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await db.update(users).set({ password: passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.email, input.email));

      // Clean up codes
      await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));

      return { success: true };
    }),

  logout: t.procedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME, { path: '/' });
    return { success: true };
  }),
});
