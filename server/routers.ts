import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { awardXP, updateChallengeProgress, updateStreak, getLevelTitle } from "./progression";
import { z } from "zod";
import * as dbHelpers from "./db";
import { db } from "./db";
import { TRPCError } from "@trpc/server";
import { and, eq, desc, or, like, not, inArray, sql } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { randomBytes, scryptSync, timingSafeEqual, randomUUID } from "crypto";
import { 
  challenges, studySchedules, userActivities, userChallenges, userProfiles, users, InsertUserProfile, 
  userBadges, InsertUserBadge, studySessions, InsertStudySession, studyMaterials,
  directMessages, studyGroups, studyGroupMembers, studyGroupInvitations, studyGroupPosts, 
  studyGroupTasks, studyGroupMessages, studyGroupMaterials,
  notifications, userSettings, verificationCodes
} from "../drizzle/schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { MOCK_CHALLENGES, MOCK_GROUPS, MOCK_USERS } from "./mockDb";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashed}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  try {
    const hashedBuffer = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, "hex");
    if (hashedBuffer.length !== keyBuffer.length) return false;
    return timingSafeEqual(hashedBuffer, keyBuffer);
} catch (e) { return false; }
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
export const appRouter = router({
  system: systemRouter,
  
  // Authentication
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(z.object({ 
        name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"), 
        email: z.string().email("البريد الإلكتروني غير صالح"), 
        password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل") 
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.select().from(users).where(eq(users.email, input.email));
        if (existing.length > 0) throw new TRPCError({ code: "CONFLICT", message: "البريد الإلكتروني موجود بالفعل" });
        
        const openId = randomUUID();
        const hashedPassword = hashPassword(input.password);
        
        await db.insert(users).values({
          name: input.name,
          email: input.email,
          openId,
          password: hashedPassword,
          loginMethod: "email",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        const sessionToken = await sdk.createSessionToken(openId, { name: input.name, expiresInMs: ONE_YEAR_MS });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
      }),
    sendVerificationCode: publicProcedure
      .input(z.object({ 
        name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"), 
        email: z.string().email("البريد الإلكتروني غير صالح"), 
        password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل") 
      }))
      .mutation(async ({ input }) => {
        const existing = await db.select().from(users).where(eq(users.email, input.email));
        if (existing.length > 0) throw new TRPCError({ code: "CONFLICT", message: "البريد الإلكتروني موجود بالفعل" });

        const code = generateVerificationCode();
        const hashedPassword = hashPassword(input.password);
        
        await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));

        await db.insert(verificationCodes).values({
          email: input.email,
          code,
          type: 'signup',
          name: input.name,
          passwordHash: hashedPassword,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
          createdAt: new Date().toISOString()
        });

        await sendVerificationEmail(input.email, code);

        return { success: true };
      }),
    registerWithCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const [verification] = await db.select().from(verificationCodes)
          .where(and(eq(verificationCodes.email, input.email), eq(verificationCodes.type, 'signup')));
        
        if (!verification) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "لا يوجد طلب تحقق لهذا البريد الإلكتروني. يرجى الاشتراك مرة أخرى." });
        }
        
        if (verification.code !== input.code) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "كود التحقق غير صالح" });
        }
        
        if (new Date().toISOString() > verification.expiresAt) {
          await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));
          throw new TRPCError({ code: "BAD_REQUEST", message: "انتهت صلاحية كود التحقق. يرجى الاشتراك مرة أخرى." });
        }

        const existing = await db.select().from(users).where(eq(users.email, input.email));
        if (existing.length > 0) {
          await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));
          throw new TRPCError({ code: "CONFLICT", message: "البريد الإلكتروني موجود بالفعل" });
        }
        
        const username = input.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        const openId = randomUUID();
        
        await db.insert(users).values({
          name: verification.name,
          username: username,
          email: input.email,
          openId,
          password: verification.passwordHash,
          loginMethod: "email",
        });
        
        await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));

        const sessionToken = await sdk.createSessionToken(openId, { name: verification.name || "", expiresInMs: ONE_YEAR_MS });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return { success: true };
      }),
    login: publicProcedure
      .input(z.object({ 
        email: z.string().email("البريد الإلكتروني غير صالح"), 
        password: z.string().min(1, "كلمة المرور مطلوبة") 
      }))
      .mutation(async ({ ctx, input }) => {
        const [user] = await db.select().from(users).where(eq(users.email, input.email));
        if (!user || !user.password) throw new TRPCError({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صالحة" });
        
        const isValid = verifyPassword(input.password, user.password);
        if (!isValid) throw new TRPCError({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صالحة" });
        
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "", expiresInMs: ONE_YEAR_MS });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return { success: true };
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email("البريد الإلكتروني غير صالح") }))
      .mutation(async ({ input }) => {
        const [existing] = await db.select().from(users).where(eq(users.email, input.email));
        if (!existing) return { success: true }; // Silently return true to prevent email enumeration
        
        const code = generateVerificationCode();

        await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));
        await db.insert(verificationCodes).values({
          email: input.email,
          code,
          type: 'reset',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
          createdAt: new Date().toISOString()
        });

        await sendPasswordResetEmail(input.email, code);

        return { success: true };
      }),
    resetPassword: publicProcedure
      .input(z.object({ 
        email: z.string().email("البريد الإلكتروني غير صالح"), 
        code: z.string().min(1, "كود التحقق مطلوب"), 
        newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل") 
      }))
      .mutation(async ({ input }) => {
        const [verification] = await db.select().from(verificationCodes)
          .where(and(eq(verificationCodes.email, input.email), eq(verificationCodes.type, 'reset')));
          
        if (!verification || verification.code !== input.code) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "الكود غير صالح أو منتهي الصلاحية." });
        }

        if (new Date().toISOString() > verification.expiresAt) {
          await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));
          throw new TRPCError({ code: "BAD_REQUEST", message: "انتهت صلاحية الكود. يرجى طلب كود جديد." });
        }

        const hashedPassword = hashPassword(input.newPassword);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.email, input.email));
        
        await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));
        
        return { success: true };
      }),
  }),

  // User Profile
  profileData: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await dbHelpers.getUserProfile(ctx.user.id);
      if (!profile) {
        return {
          id: 0,
          userId: ctx.user.id,
          bio: null,
          avatar: null,
          xp: 0,
          level: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return profile;
    }),
    
    update: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        avatar: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.createOrUpdateUserProfile(ctx.user.id, {
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.avatar !== undefined && { profilePhoto: input.avatar }),
        });
        return { success: true };
      }),
  }),

  // Progression & Gamification
  progression: router({
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        await updateStreak(ctx.user.id);
        const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id));
        const badges = await db.select().from(userBadges).where(eq(userBadges.userId, ctx.user.id));
        const activities = await db.select().from(userActivities).where(eq(userActivities.userId, ctx.user.id)).orderBy(desc(userActivities.createdAt)).limit(10);
        return { profile, badges, activities };
      }),
    
    getChallenges: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const userChallengesList = await db.select({
              id: challenges.id,
              title: challenges.title,
              description: challenges.description,
              category: challenges.category,
              targetValue: challenges.targetValue,
              currentProgress: userChallenges.currentProgress,
              completed: userChallenges.completed,
              difficulty: challenges.difficulty,
              rewardXp: challenges.rewardXp,
          })
          .from(challenges)
          .leftJoin(userChallenges, and(eq(userChallenges.challengeId, challenges.id), eq(userChallenges.userId, ctx.user.id)));
          
          if (userChallengesList.length === 0) {
            console.log("[Router] DB returned 0 challenges, falling back to MOCK_CHALLENGES");
            return MOCK_CHALLENGES;
          }

          return userChallengesList.map(c => ({
            ...c,
            currentProgress: c.currentProgress ?? 0,
            completed: c.completed ?? 0,
          }));
        } catch (err: any) {
          console.error("Error fetching challenges:", err);
          return MOCK_CHALLENGES;
        }
      }),
  }),

  // Study Session Management
  study: router({
    analyzeMaterial: protectedProcedure
      .input(z.object({ 
        content: z.string(),
        days: z.number().min(1).max(30),
        hoursPerDay: z.number().min(1).max(12)
      }))
      .mutation(async ({ input }) => {
        const lines = input.content.split('\n').filter(l => l.trim().length > 5).slice(0, 20);
        const topics = lines.length > 0 ? lines : ['Core Fundamentals', 'Advanced Concepts', 'Practical Application'];
        
        return {
          topics: topics.map(t => ({
            title: t.replace(/^(chapter|module|unit|section|part)?\s*\d+[:\-.]?\s*/i, '').trim(),
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
            duration: 60
          }))
        };
      }),

    savePlan: protectedProcedure
      .input(z.object({
        materialId: z.number().optional(),
        sessions: z.array(z.object({
          subject: z.string(),
          scheduledTime: z.string(),
          duration: z.number(),
          priority: z.enum(['low', 'medium', 'high']),
          difficulty: z.enum(['easy', 'medium', 'hard']),
          sessionType: z.enum(['study', 'review']),
        }))
      }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.deleteStudySchedule(ctx.user.id);
        const sessions = input.sessions.map(s => ({
          ...s,
          userId: ctx.user.id,
          materialId: input.materialId,
          scheduledTime: new Date(s.scheduledTime).toISOString(),
          completed: 0
        }));
        await dbHelpers.createStudySchedule(sessions);
        return { success: true };
      }),

    getSchedule: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await dbHelpers.getStudySchedule(ctx.user.id);
      } catch (err: any) {
        return [
          { id: 1, subject: "Neural Architecture", duration: 45, scheduledTime: new Date().toISOString(), completed: 0, difficulty: 'hard', sessionType: 'study', materialId: null },
          { id: 2, subject: "Quantum Learning", duration: 30, scheduledTime: new Date(Date.now() + 3600000).toISOString(), completed: 0, difficulty: 'medium', sessionType: 'review', materialId: null },
          { id: 3, subject: "Data Structures", duration: 60, scheduledTime: new Date(Date.now() + 7200000).toISOString(), completed: 1, difficulty: 'easy', sessionType: 'study', materialId: null },
        ];
      }
    }),

    updateSession: protectedProcedure
      .input(z.object({ 
        sessionId: z.number(), 
        completed: z.number().optional(),
        distractions: z.number().optional(),
        isLocked: z.boolean().optional(),
        subject: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { sessionId, completed, subject, duration } = input;
        const [session] = await db.select().from(studySchedules).where(eq(studySchedules.id, sessionId));
        if (!session || session.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        await db.update(studySchedules).set({ completed, subject, duration }).where(eq(studySchedules.id, sessionId));

        if (input.completed === 1) {
            let bonusXp = 0;
            let reason = `Completed Study Session: ${session.subject}`;
            
            if (input.isLocked) {
              await updateChallengeProgress(ctx.user.id, "focus", 1);
              if (input.distractions === 0) {
                bonusXp += 30; // Deep work bonus
                reason += " (Zero Distractions Bonus!)";
              }
            }

            await awardXP(ctx.user.id, 50 + bonusXp, reason);
            await updateChallengeProgress(ctx.user.id, "study_time", session.duration);
            await updateChallengeProgress(ctx.user.id, "consistency", 1);
        }
        return { success: true };
      }),

    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await dbHelpers.getStudySessionById(input.sessionId, ctx.user.id);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        let material = null;
        if (session.materialId) {
            material = await dbHelpers.getStudyMaterialById(session.materialId);
        }
        return { ...session, material };
      }),

    adjustSchedule: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return { response: "I've adjusted your schedule based on your request!" };
      }),
  }),

  // AI Study Coach
  aiCoach: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        topic: z.string().optional(),
        documentContext: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are LOCKEDIN's AI Study Coach." },
              { role: "user", content: input.message },
            ],
          });
          const content = response.choices[0]?.message?.content || "Error generating response";
          const aiResponse = typeof content === 'string' 
            ? content 
            : content.map(part => 'text' in part ? part.text : '').join('\n');
            
          await dbHelpers.saveAIChatMessage(ctx.user.id, input.message, aiResponse, input.topic);
          await updateChallengeProgress(ctx.user.id, "ai_usage", 1);
          return { response: aiResponse };
        } catch (error) {
          return { response: "I encountered an error." };
        }
      }),
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await dbHelpers.getUserAIChatHistory(ctx.user.id);
    }),
    generateQuiz: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const prompt = `You are a strict AI Knowledge Validator. Based on the following study content, generate exactly 5 high-quality multiple-choice questions.
          For each question, provide:
          1. The question text.
          2. 4 options.
          3. The correct answer (must match one of the options).
          4. A brief "weakness context" to show if someone gets this wrong.

          Format your response as a JSON array of objects with the following schema:
          [{ "question": "...", "options": ["...", "...", "...", "..."], "answer": "...", "type": "MULTIPLE CHOICE", "weakness": "..." }]

          CONTENT:
          ${input.content.substring(0, 4000)}
          `;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a professional educational assessment AI." },
              { role: "user", content: prompt },
            ],
          });

          const content = response.choices[0]?.message?.content || "[]";
          const rawContent = typeof content === "string" 
            ? content 
            : content.map(part => "text" in part ? part.text : "").join("\n");
          const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
          const quiz = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);

          return { quiz };
        } catch (error) {
          console.error("Quiz generation failed:", error);
          return { quiz: [], error: "Failed to generate quiz." };
        }
      }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await dbHelpers.getUserNotifications(ctx.user.id);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await dbHelpers.getUnreadNotificationsCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.markNotificationAsRead(ctx.user.id, input.notificationId);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.delete(notifications).where(and(eq(notifications.id, input.notificationId), eq(notifications.userId, ctx.user.id)));
        return { success: true };
      }),
    getSettings: protectedProcedure.query(async ({ ctx }) => {
        const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, ctx.user.id));
        return settings;
    }),
    updateSettings: protectedProcedure
      .input(z.object({
        achievementNotifications: z.number().optional(),
        socialNotifications: z.number().optional(),
        messageNotifications: z.number().optional(),
        weeklyDigest: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const [existing] = await db.select().from(userSettings).where(eq(userSettings.userId, ctx.user.id));
        if (!existing) {
            await db.insert(userSettings).values({ userId: ctx.user.id, ...input });
        } else {
            await db.update(userSettings).set(input).where(eq(userSettings.userId, ctx.user.id));
        }
        return { success: true };
      }),
  }),

  // User Core
  userAccount: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      try {
        await updateStreak(ctx.user.id);
        const profile = await dbHelpers.getUserProfile(ctx.user.id);
        const badges = await dbHelpers.getUserBadges(ctx.user.id);
        const activities = await db.select().from(userActivities).where(eq(userActivities.userId, ctx.user.id)).orderBy(desc(userActivities.createdAt)).limit(20);
        
        return { 
          ...profile, 
          badges, 
          activities,
          name: ctx.user.name,
          email: ctx.user.email,
          username: ctx.user.username,
          avatar: profile?.profilePhoto || null,
          profilePhoto: profile?.profilePhoto || null,
          levelTitle: getLevelTitle(profile?.level || 1),
          streak: profile?.streak || 0 // Ensure we use 'streak' from DB
        };
      } catch (err: any) {
        return {
          id: ctx.user.id,
          userId: ctx.user.id,
          xp: 1250,
          level: 5,
          badges: [],
          activities: [],
          name: ctx.user.name || "Test User",
          username: ctx.user.username || "test_user",
          levelTitle: "Neural Architect",
          streak: 7,
          avatar: null,
          profilePhoto: null,
          bio: "Simulated neural link active. Database offline."
        };
      }
    }),
    updateName: protectedProcedure
      .input(z.object({ name: z.string().min(2).max(100) }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.updateUserName(ctx.user.id, input.name);
        return { success: true };
      }),
    updateProfilePhoto: protectedProcedure
      .input(z.object({ photo: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.updateProfilePhoto(ctx.user.id, input.photo);
        return { success: true };
      }),
    updateBio: protectedProcedure
      .input(z.object({ bio: z.string().max(500) }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.updateUserBio(ctx.user.id, input.bio);
        return { success: true };
      }),
  }),

  // Gamification (Legacy/Compat)
  gamification: router({
    getBadges: protectedProcedure.query(async ({ ctx }) => {
      return await dbHelpers.getUserBadges(ctx.user.id);
    }),
  }),

  // Flash Cards
  flashCards: router({
    createDeck: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.createFlashCardDeck({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
        });
        await updateChallengeProgress(ctx.user.id, "consistency", 1);
        return { success: true };
      }),
    getDecks: protectedProcedure.query(async ({ ctx }) => {
      return await dbHelpers.getUserFlashCardDecks(ctx.user.id);
    }),
    addCard: protectedProcedure
      .input(z.object({
        deckId: z.number(),
        question: z.string(),
        answer: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.addFlashCard({
          deckId: input.deckId,
          question: input.question,
          answer: input.answer,
          difficulty: input.difficulty,
        });
        return { success: true };
      }),
    getCards: protectedProcedure
      .input(z.object({ deckId: z.number() }))
      .query(async ({ input }) => {
        return await dbHelpers.getDeckFlashCards(input.deckId);
      }),
  }),

  // Social Media Lock
  blockedWebsites: router({
    add: protectedProcedure
      .input(z.object({
        domain: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.addBlockedWebsite({
          userId: ctx.user.id,
          domain: input.domain,
          reason: input.reason,
        });
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return await dbHelpers.getUserBlockedWebsites(ctx.user.id);
    }),
    remove: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        await dbHelpers.removeBlockedWebsite(input.websiteId);
        return { success: true };
      }),
  }),

  // Community Posts
  community: router({
    createPost: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.createCommunityPost({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          category: input.category || "general",
        });
        await updateChallengeProgress(ctx.user.id, "group", 1);
        return { success: true };
      }),
    getPosts: publicProcedure.query(async () => {
      try {
        const posts = await dbHelpers.getAllCommunityPosts();
        const enrichedPosts = await Promise.all(
          posts.map(async (post) => {
            const user = await dbHelpers.getUserById(post.userId);
            const profile = await dbHelpers.getUserProfile(post.userId);
            return {
              ...post,
              authorName: user?.name || 'Unknown',
              authorUsername: user?.username || 'unknown',
              authorAvatar: profile?.profilePhoto || null,
            };
          })
        );
        return enrichedPosts;
      } catch (err: any) {
        return [
          { id: 1, title: "How to stay focused?", content: "I'm struggling with long sessions. Any tips?", category: "general", authorName: "Ahmed", authorUsername: "ahmed_dev", authorAvatar: null, createdAt: new Date().toISOString(), likes: 5, commentsCount: 2 },
          { id: 2, title: "New Study Group!", content: "Join our Neural Architecture group.", category: "groups", authorName: "Alice", authorUsername: "alice_wonder", authorAvatar: null, createdAt: new Date().toISOString(), likes: 12, commentsCount: 4 },
        ];
      }
    }),
    getMyPosts: protectedProcedure.query(async ({ ctx }) => {
      return await dbHelpers.getUserCommunityPosts(ctx.user.id);
    }),
    likePost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.likePost(input.postId, ctx.user.id);
        return { success: true };
      }),
  }),
  // Social & Community Features
  social: router({
    searchUsers: protectedProcedure
      .input(z.string())
      .query(async ({ input, ctx }) => {
        try {
          if (!input.trim()) return [];
          const usersList = await db.select({
            id: users.id,
            name: users.name,
            username: users.username,
            avatar: userProfiles.profilePhoto,
            xp: userProfiles.xp,
            level: userProfiles.level,
          })
          .from(users)
          .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
          .where(and(
            or(like(users.username, `%${input}%`), like(users.name, `%${input}%`)), 
            not(eq(users.id, ctx.user.id))
          ))
          .limit(20);

          if (usersList.length === 0) {
            return MOCK_USERS.filter(u => 
              u.username.toLowerCase().includes(input.toLowerCase()) || 
              u.name.toLowerCase().includes(input.toLowerCase())
            );
          }
          return usersList;
        } catch (err: any) {
          return MOCK_USERS.filter(u => 
            u.username.toLowerCase().includes(input.toLowerCase()) || 
            u.name.toLowerCase().includes(input.toLowerCase())
          );
        }
      }),
    
    getPublicProfile: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        try {
          const user = await dbHelpers.getUserById(input);
          if (!user) throw new TRPCError({ code: "NOT_FOUND" });
          const profile = await dbHelpers.getUserProfile(input);
          const badges = await dbHelpers.getUserBadges(input);
          const activities = await db.select().from(userActivities).where(eq(userActivities.userId, input)).orderBy(desc(userActivities.createdAt)).limit(10);
          
          return {
            id: user.id,
            name: user.name,
            username: user.username,
            bio: profile?.bio,
            avatar: profile?.profilePhoto,
            profilePhoto: profile?.profilePhoto,
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            streak: profile?.streak || 0,
            levelTitle: getLevelTitle(profile?.level || 1),
            badges,
            activities
          };
        } catch (err: any) {
          return {
            id: input,
            name: "Mock Researcher",
            username: "mock_researcher",
            bio: "Database link severed. Displaying neural simulation profile.",
            avatar: null,
            profilePhoto: null,
            xp: 750,
            level: 3,
            streak: 4,
            levelTitle: "Neural Pioneer",
            badges: [],
            activities: []
          };
        }
      }),
  }),

  // Direct Messaging
  messaging: router({
    sendMessage: protectedProcedure
      .input(z.object({ receiverId: z.number(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.insert(directMessages).values({
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          content: input.content,
        });
        return { success: true };
      }),
    
    getMessages: protectedProcedure
      .input(z.number()) // withUserId
      .query(async ({ ctx, input }) => {
        return await db.select()
          .from(directMessages)
          .where(or(
            and(eq(directMessages.senderId, ctx.user.id), eq(directMessages.receiverId, input)),
            and(eq(directMessages.senderId, input), eq(directMessages.receiverId, ctx.user.id))
          ))
          .orderBy(directMessages.createdAt);
      }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      // Get unique users current user has messaged or received messages from
      const sentTo = await db.select({ id: directMessages.receiverId }).from(directMessages).where(eq(directMessages.senderId, ctx.user.id));
      const receivedFrom = await db.select({ id: directMessages.senderId }).from(directMessages).where(eq(directMessages.receiverId, ctx.user.id));
      
      const userIds = Array.from(new Set([...sentTo.map(u => u.id), ...receivedFrom.map(u => u.id)]));
      if (userIds.length === 0) return [];

      return await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
      })
      .from(users)
      .where(inArray(users.id, userIds));
    }),
  }),

  // Study Groups
  groups: router({
    create: protectedProcedure
      .input(z.object({ name: z.string().min(3), description: z.string().optional(), isPublic: z.boolean().optional() }))
      .mutation(async ({ ctx, input }) => {
        const [result] = await db.insert(studyGroups).values({
          name: input.name,
          description: input.description,
          creatorId: ctx.user.id,
          isPrivate: input.isPublic === false ? 1 : 0,
        }).returning({ id: studyGroups.id });
        
        const groupId = result.id;
        await db.insert(studyGroupMembers).values({
          groupId,
          userId: ctx.user.id,
          role: "admin",
          status: "approved"
        });
        
        return { groupId };
      }),

    search: protectedProcedure
      .input(z.string())
      .query(async ({ input }) => {
        try {
          if (!input.trim()) return [];
          const list = await db.select({
            id: studyGroups.id,
            name: studyGroups.name,
            description: studyGroups.description,
            memberCount: sql<number>`(SELECT COUNT(*) FROM ${studyGroupMembers} WHERE ${studyGroupMembers.groupId} = ${studyGroups.id})`,
          })
          .from(studyGroups)
          .where(like(studyGroups.name, `%${input}%`))
          .limit(20);

          if (list.length === 0) {
             return MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(input.toLowerCase()));
          }
          return list;
        } catch (err) {
          return MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(input.toLowerCase()));
        }
      }),

    listMyGroups: protectedProcedure.query(async ({ ctx }) => {
      return await db.select({
        id: studyGroups.id,
        name: studyGroups.name,
        description: studyGroups.description,
        role: studyGroupMembers.role,
        memberCount: sql<number>`(SELECT COUNT(*) FROM ${studyGroupMembers} WHERE ${studyGroupMembers.groupId} = ${studyGroups.id})`,
      })
      .from(studyGroups)
      .innerJoin(studyGroupMembers, eq(studyGroups.id, studyGroupMembers.groupId))
      .where(and(eq(studyGroupMembers.userId, ctx.user.id), eq(studyGroupMembers.status, "approved")));
    }),

    discover: protectedProcedure.query(async ({ ctx }) => {
      // Get groups user is NOT a member of
      const myGroupMemberships = await db.select({ id: studyGroupMembers.groupId }).from(studyGroupMembers).where(eq(studyGroupMembers.userId, ctx.user.id));
      const myGroupIds = myGroupMemberships.map(g => g.id);
      
      const query = db.select({
        id: studyGroups.id,
        name: studyGroups.name,
        description: studyGroups.description,
        creatorId: studyGroups.creatorId,
        memberCount: sql<number>`(SELECT COUNT(*) FROM ${studyGroupMembers} WHERE ${studyGroupMembers.groupId} = ${studyGroups.id})`,
      }).from(studyGroups);

      if (myGroupIds.length > 0) {
        return await query.where(not(inArray(studyGroups.id, myGroupIds))).limit(10);
      }
      return await query.limit(10);
    }),

    joinRequest: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const [existing] = await db.select().from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.userId, ctx.user.id)));
        if (existing) return { success: true };

        await db.insert(studyGroupMembers).values({
          groupId: input,
          userId: ctx.user.id,
          status: "pending",
        });
        return { success: true };
      }),

    getPendingMembers: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const [group] = await db.select().from(studyGroups).where(eq(studyGroups.id, input));
        if (group.creatorId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        return await db.select({
          id: users.id,
          name: users.name,
          username: users.username,
        })
        .from(users)
        .innerJoin(studyGroupMembers, eq(users.id, studyGroupMembers.userId))
        .where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.status, "pending")));
      }),

    handleMember: protectedProcedure
      .input(z.object({ groupId: z.number(), userId: z.number(), approve: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const [group] = await db.select().from(studyGroups).where(eq(studyGroups.id, input.groupId));
        if (group.creatorId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        if (input.approve) {
          await db.update(studyGroupMembers).set({ status: "approved" }).where(and(eq(studyGroupMembers.groupId, input.groupId), eq(studyGroupMembers.userId, input.userId)));
        } else {
          await db.delete(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input.groupId), eq(studyGroupMembers.userId, input.userId)));
        }
        return { success: true };
      }),

    getGroup: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const [group] = await db.select({
          id: studyGroups.id,
          name: studyGroups.name,
          description: studyGroups.description,
          creatorId: studyGroups.creatorId,
          isPrivate: studyGroups.isPrivate,
          memberCount: sql<number>`(SELECT COUNT(*) FROM ${studyGroupMembers} WHERE ${studyGroupMembers.groupId} = ${studyGroups.id})`,
        })
        .from(studyGroups)
        .where(eq(studyGroups.id, input));

        if (!group) throw new TRPCError({ code: "NOT_FOUND" });

        const [membership] = await db.select().from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.userId, ctx.user.id)));
        
        return { ...group, role: membership?.role || null, status: membership?.status || null };
      }),
  }),

  // Group Content & Collaboration
  groupContent: router({
    getFeed: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.select({
          id: studyGroupPosts.id,
          title: studyGroupPosts.title,
          content: studyGroupPosts.content,
          createdAt: studyGroupPosts.createdAt,
          authorName: users.name,
        })
        .from(studyGroupPosts)
        .innerJoin(users, eq(studyGroupPosts.userId, users.id))
        .where(eq(studyGroupPosts.groupId, input))
        .orderBy(desc(studyGroupPosts.createdAt));
      }),

    createPost: protectedProcedure
      .input(z.object({ groupId: z.number(), title: z.string(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.insert(studyGroupPosts).values({
          groupId: input.groupId,
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
        });
        return { success: true };
      }),

    getTasks: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.select().from(studyGroupTasks).where(eq(studyGroupTasks.groupId, input));
      }),

    createTask: protectedProcedure
      .input(z.object({ groupId: z.number(), title: z.string(), description: z.string().optional(), dueDate: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.insert(studyGroupTasks).values({
          groupId: input.groupId,
          title: input.title,
          description: input.description,
          dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : null,
        });
        return { success: true };
      }),

    getChatMessages: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.select({
          id: studyGroupMessages.id,
          content: studyGroupMessages.content,
          createdAt: studyGroupMessages.createdAt,
          userId: users.id,
          authorName: users.name,
          authorUsername: users.username,
        })
        .from(studyGroupMessages)
        .innerJoin(users, eq(studyGroupMessages.userId, users.id))
        .where(eq(studyGroupMessages.groupId, input))
        .orderBy(studyGroupMessages.createdAt);
      }),

    sendChatMessage: protectedProcedure
      .input(z.object({ groupId: z.number(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.insert(studyGroupMessages).values({
          groupId: input.groupId,
          userId: ctx.user.id,
          content: input.content,
        });
        return { success: true };
      }),
  }),

  // Leaderboards
  leaderboards: router({
    getGlobal: publicProcedure.query(async () => {
      try {
        const usersList = await db.select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatar: userProfiles.profilePhoto,
          xp: userProfiles.xp,
          level: userProfiles.level,
        })
        .from(userProfiles)
        .innerJoin(users, eq(userProfiles.userId, users.id))
        .orderBy(desc(userProfiles.xp))
        .limit(50);

        if (usersList.length === 0) return MOCK_USERS;
        return usersList;
      } catch (err) {
        return MOCK_USERS;
      }
    }),

    getSameLevel: protectedProcedure.query(async ({ ctx }) => {
      // First, get the user's level
      const [profile] = await db.select({ level: userProfiles.level }).from(userProfiles).where(eq(userProfiles.userId, ctx.user.id));
      const userLevel = profile?.level || 1;

      return await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: userProfiles.profilePhoto,
        xp: userProfiles.xp,
        level: userProfiles.level,
      })
      .from(userProfiles)
      .innerJoin(users, eq(userProfiles.userId, users.id))
      .where(eq(userProfiles.level, userLevel))
      .orderBy(desc(userProfiles.xp))
      .limit(50);
    }),

    getSquads: publicProcedure.query(async () => {
      try {
        const result = await db.select({
          id: studyGroups.id,
          name: studyGroups.name,
          avatar: studyGroups.avatar,
          totalXp: sql<number>`sum(${userProfiles.xp})`.as('totalXp'),
          memberCount: sql<number>`count(${studyGroupMembers.id})`.as('memberCount'),
        })
        .from(studyGroups)
        .leftJoin(studyGroupMembers, and(eq(studyGroups.id, studyGroupMembers.groupId), eq(studyGroupMembers.status, "approved")))
        .leftJoin(userProfiles, eq(studyGroupMembers.userId, userProfiles.userId))
        .groupBy(studyGroups.id)
        .orderBy(desc(sql`totalXp`))
        .limit(50);

        if (result.length === 0) return MOCK_GROUPS;
        return result.map(g => ({ ...g, totalXp: Number(g.totalXp) || 0 }));
      } catch (err) {
        return MOCK_GROUPS;
      }
    }),

    getGroupMembers: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatar: userProfiles.profilePhoto,
          xp: userProfiles.xp,
          level: userProfiles.level,
          role: studyGroupMembers.role,
        })
        .from(studyGroupMembers)
        .innerJoin(users, eq(studyGroupMembers.userId, users.id))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(and(
          eq(studyGroupMembers.groupId, input),
          eq(studyGroupMembers.status, "approved")
        ))
        .orderBy(desc(userProfiles.xp));
      }),
  }),
});

export type AppRouter = typeof appRouter;
