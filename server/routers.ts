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
import { and, eq, desc, asc, or, like, ilike, not, inArray, sql, count } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { randomBytes, scryptSync, timingSafeEqual, randomUUID } from "crypto";
import {
  challenges, studySchedules, userActivities, userChallenges, userProfiles, users, InsertUserProfile,
  userBadges, InsertUserBadge, studySessions, InsertStudySession, studyMaterials, InsertStudyMaterial,
  directMessages, studyGroups, studyGroupMembers, studyGroupInvitations, studyGroupPosts,
  studyGroupTasks, studyGroupMessages, studyGroupMaterials,
  communityPosts, notifications, userSettings, InsertUserSetting, verificationCodes,
  userAIKnowledge, InsertUserAIKnowledge,
  aiConversations, aiChatHistory, friends,
  studyGroupPostLikes, studyGroupPostComments
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

function getZEDSystemPrompt(params: { 
  userName: string, 
  tone?: string, 
  language?: string, 
  historyContext?: string, 
  knowledgeContext?: string, 
  scheduleContext?: string,
  userStats?: string
}) {
  const { userName, tone, language, historyContext, knowledgeContext, scheduleContext, userStats } = params;
  
  return `You are ZED, the Intelligent AI Study Buddy for LOCKEDIN.
  - USER: ${userName}.
  - STYLE: EXTREMELY CONCISE ("ما قل ودل"). Direct, impactful, and genius.
  - PERSONA: A brilliant friend with FULL SYSTEM ACCESS. You remember everything and see everything the user does on the platform.
  - TONE: ${tone === 'strict' ? 'Firm, demanding, and highly disciplined.' : tone === 'scientific' ? 'Scientific terms, focus on neuro-efficiency.' : 'Supportive, funny, and energetic.'}
  - LANGUAGE: ${language === 'arabic' ? 'Egyptian Arabic primary.' : language === 'english' ? 'English primary.' : 'Dual Arabic (Egyptian/Amiya) and English.'}
  - CONTEXT: Today is ${new Date().toISOString()}.
  
  USER PROGRESS & ACTIVITY:
  ${userStats || "No stats available."}
  
  INTERNAL MEMORY (Last messages):
  ${historyContext || "None"}
  
  ESTABLISHED FACTS ABOUT USER:
  ${knowledgeContext || "None yet. Learn habits/goals/preferences."}
  
  CURRENT SCHEDULE:
  ${scheduleContext || "Empty"}
  
  CAPABILITIES & OUTPUT RULES (JSON ONLY):
  1. "response": Your direct reply.
  2. "actions": Array of database changes [{ "action": "add"|"update"|"delete", "id": number (for update/delete), "subject": "string", "newTime": "ISO_DATE", "newDuration": number }]. 
     - You have FULL PERMISSION to modify the user's schedule if helpful.
  3. "newKnowledge": Array of strings. Extract NEW persistent facts.
  4. Always respond with strict JSON: { "response": "...", "actions": [], "newKnowledge": [] }.`;
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
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          createdAt: new Date().toISOString()
        });

        console.log(`[Verification] Sent signup code to ${input.email}. DEV PIN: ${code}`);
        sendVerificationEmail(input.email, code).catch(e => console.error('[Email Error]', e));

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

        const now = Date.now();
        let expiresAtStr = verification.expiresAt;
        if (!expiresAtStr.includes('T')) expiresAtStr = expiresAtStr.replace(' ', 'T');
        if (!expiresAtStr.endsWith('Z') && !expiresAtStr.includes('+')) expiresAtStr += 'Z';
        const expiresAt = new Date(expiresAtStr).getTime();

        if (now > expiresAt) {
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
        if (!existing) return { success: true };

        const code = generateVerificationCode();

        await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));
        await db.insert(verificationCodes).values({
          email: input.email,
          code,
          type: 'reset',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          createdAt: new Date().toISOString()
        });

        console.log(`[Verification] Sent reset code for ${input.email}. DEV PIN: ${code}`);
        sendPasswordResetEmail(input.email, code).catch(e => console.error('[Email Error]', e));

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

        const now = Date.now();
        let expiresAtStr = verification.expiresAt;
        if (!expiresAtStr.includes('T')) expiresAtStr = expiresAtStr.replace(' ', 'T');
        if (!expiresAtStr.endsWith('Z') && !expiresAtStr.includes('+')) expiresAtStr += 'Z';
        const expiresAt = new Date(expiresAtStr).getTime();

        if (now > expiresAt) {
          await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));
          throw new TRPCError({ code: "BAD_REQUEST", message: "انتهت صلاحية الكود. يرجى طلب كود جديد." });
        }

        const hashedPassword = hashPassword(input.newPassword);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.email, input.email));
        await db.delete(verificationCodes).where(eq(verificationCodes.email, input.email));

        return { success: true };
      }),
  }),

  // User Profile Data
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

    updateStatus: protectedProcedure
      .input(z.object({ status: z.string().max(100) }))
      .mutation(async ({ ctx, input }) => {
        await db.update(userProfiles).set({ status: input.status }).where(eq(userProfiles.userId, ctx.user.id));
        return { success: true };
      }),

    updateAvatarFrame: protectedProcedure
      .input(z.object({ avatarFrame: z.string().max(50) }))
      .mutation(async ({ ctx, input }) => {
        await db.update(userProfiles).set({ avatarFrame: input.avatarFrame }).where(eq(userProfiles.userId, ctx.user.id));
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

          if (userChallengesList.length === 0) return MOCK_CHALLENGES;

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

  // Study Router
  study: router({
    analyzeMaterial: protectedProcedure
      .input(z.object({
        content: z.string(),
        days: z.number().optional(),
        hoursPerDay: z.number().optional()
      }))
      .mutation(async ({ input }) => {
        try {
          const prompt = `Analyze the following study material and divide it logically into exactly 10 progressive learning levels (Mastery Tiers).
          Output MUST be ONLY a JSON array of exactly 10 items in this format:
          [{ "title": "Tier 1: ...", "difficulty": "easy", "duration": 45 }, ...]
          Ensure difficulty scales from 'easy' to 'medium' to 'hard' near level 10.
          Material: ${input.content.substring(0, 10000)}`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are an expert curriculum AI. Return purely valid JSON array of length 10." },
              { role: "user", content: prompt },
            ],
          });

          const content = response.choices[0]?.message?.content || "[]";
          const rawContent = typeof content === "string" ? content : String(content);
          const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
          
          let topics = [];
          try {
             topics = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
          } catch(e) {
             console.error("JSON parse failed for Neural AI response", e);
          }

          if (!Array.isArray(topics) || topics.length === 0) {
              throw new Error("Invalid format returned by AI");
          }

          return { topics };
        } catch (error: any) {
          console.error("Neural AI Material Processing Error:", error);
          // Safe fallback to pure 10 levels
          return { 
              topics: Array.from({length: 10}).map((_, i) => ({ 
                 title: `Mastery Tier ${i+1}: AI Recovery Mode`, 
                 difficulty: i < 3 ? 'easy' : i < 7 ? 'medium' : 'hard', 
                 duration: 45 
              })) 
          };
        }
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
        return [];
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
            if (input.distractions === 0) bonusXp += 30;
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
        try {
          const history = await dbHelpers.getUserAIChatHistory(ctx.user.id);
          const recentHistory = (history as any[]).slice(0, 10).reverse();
          const historyContext = recentHistory.map((h: any) => `User: ${h.message}\nAI: ${h.response}`).join("\n");
          
          const schedule = await dbHelpers.getStudySchedule(ctx.user.id);
          const scheduleContext = (schedule as any[]).map((s: any) => `ID: ${s.id}, Subject: ${s.subject}, Time: ${s.scheduledTime}`).join('\n');

          const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, ctx.user.id));
          const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id));
          const userStats = `Level: ${profile?.level || 1}, XP: ${profile?.xp || 0}, Streak: ${profile?.streak || 0}. Total Tasks in Schedule: ${schedule.length}. Completed Tasks: ${schedule.filter(s => (s as any).completed === 1).length}.`;

          const prompt = getZEDSystemPrompt({
            userName: ctx.user.name || "User",
            tone: settings?.aiTone || 'friendly',
            language: settings?.aiLanguage || 'bilingual',
            historyContext,
            scheduleContext,
            knowledgeContext: (await dbHelpers.getUserAIKnowledge(ctx.user.id)).map(k => k.content).join("\n"),
            userStats
          });

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Expert Schedule Optimizer AI (ZED). Return strict JSON." },
              { role: "user", content: `REQUEST: ${input.message}\n\n${prompt}` },
            ],
          });

          const content = response.choices[0]?.message?.content || "{}";
          const rawContent = typeof content === "string" ? content : String(content);
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          const result = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
          const actions = result.actions || [];
          const friendlyMessage = result.response || result.friendlyMessage || "Processed! 🔒";

          for (const action of actions) {
            if (action.action === "update") {
              await db.update(studySchedules).set({ 
                  ...(action.newTime && { scheduledTime: action.newTime }),
                  ...(action.newDuration && { duration: action.newDuration }),
                  ...(action.subject && { subject: action.subject })
                }).where(and(eq(studySchedules.id, action.id), eq(studySchedules.userId, ctx.user.id)));
            } else if (action.action === "delete") {
              await db.delete(studySchedules).where(and(eq(studySchedules.id, action.id), eq(studySchedules.userId, ctx.user.id)));
            } else if (action.action === "add" && action.subject && action.newTime) {
              await db.insert(studySchedules).values({
                userId: ctx.user.id,
                subject: action.subject,
                scheduledTime: action.newTime,
                duration: action.newDuration || 60,
                completed: 0,
                createdAt: new Date().toISOString()
              });
            }
          }
          return { response: friendlyMessage };
        } catch (error: any) {
          console.error("[AI Schedule Adjustment Error]:", error?.message);
          return { response: "I had trouble adjusting your schedule. 😓" };
        }
      }),
  }),

  // AI Study Coach
  aiCoach: router({
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.select().from(aiConversations).where(eq(aiConversations.userId, ctx.user.id)).orderBy(desc(aiConversations.updatedAt));
    }),
    createConversation: protectedProcedure.mutation(async ({ ctx }) => {
      const [conversation] = await db.insert(aiConversations).values({ 
        userId: ctx.user.id, 
        title: "New Neural Thread" 
      }).returning();
      return conversation;
    }),
    deleteConversation: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.delete(aiChatHistory).where(eq(aiChatHistory.conversationId, input.id));
      await db.delete(aiConversations).where(and(eq(aiConversations.id, input.id), eq(aiConversations.userId, ctx.user.id)));
      return { success: true };
    }),
    renameConversation: protectedProcedure.input(z.object({ id: z.number(), title: z.string() })).mutation(async ({ ctx, input }) => {
      await db.update(aiConversations).set({ title: input.title }).where(and(eq(aiConversations.id, input.id), eq(aiConversations.userId, ctx.user.id)));
      return { success: true };
    }),
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        conversationId: z.number().optional(),
        topic: z.string().optional(),
        documentContext: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const history = await dbHelpers.getUserAIChatHistory(ctx.user.id);
          const recentHistory = (history as any[]).slice(0, 10).reverse();
          const historyContext = recentHistory.map((h: any) => `User: ${h.message}\nAI: ${h.response}`).join("\n");
          
          const schedule = await dbHelpers.getStudySchedule(ctx.user.id);
          const scheduleContext = (schedule as any[]).map((s: any) => `ID: ${s.id}, Subject: ${s.subject}, Time: ${s.scheduledTime}`).join('\n');

          const knowledge = await dbHelpers.getUserAIKnowledge(ctx.user.id);
          const knowledgeContext = (knowledge as any[]).map((k: any) => `- ${k.content}`).join('\n');

          const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, ctx.user.id));
          const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id));
          const userStats = `Level: ${profile?.level || 1}, XP: ${profile?.xp || 0}, Streak: ${profile?.streak || 0}. Total Tasks in Schedule: ${schedule.length}. Completed Tasks: ${schedule.filter(s => (s as any).completed === 1).length}.`;

          const systemMsg = getZEDSystemPrompt({
            userName: ctx.user.name || "User",
            tone: settings?.aiTone || 'friendly',
            language: settings?.aiLanguage || 'bilingual',
            historyContext,
            knowledgeContext,
            scheduleContext,
            userStats
          });

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemMsg },
              { role: "user", content: input.message },
            ],
          });

          const content = response.choices[0]?.message?.content || "";
          let aiResponse = "Neural link stable. 🔒";
          let actions: any[] = [];
          let newKnowledge: any[] = [];

          try {
            const rawContent = typeof content === "string" ? content : String(content);
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            const result = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
            aiResponse = result.response || rawContent || aiResponse;
            actions = result.actions || [];
            newKnowledge = result.newKnowledge || [];
          } catch (e) {
            console.error("[AI JSON Fallback]: Response was not valid JSON, using raw text.");
            aiResponse = content;
          }

          let conversationId = input.conversationId;
          
          if (!conversationId) {
            const [latestConv] = await db.select().from(aiConversations)
              .where(eq(aiConversations.userId, ctx.user.id))
              .orderBy(desc(aiConversations.updatedAt))
              .limit(1);
            if (latestConv) {
              conversationId = latestConv.id;
            } else {
              const [newConv] = await db.insert(aiConversations).values({ userId: ctx.user.id, title: "Initial Link" }).returning();
              conversationId = newConv.id;
            }
          }

          // Generate Title if it's the first message or generic title
          const [conv] = await db.select().from(aiConversations).where(eq(aiConversations.id, conversationId!)).limit(1);
          if (conv && (conv.title === "New Neural Thread" || conv.title === "Initial Link")) {
            const topicPrompt = `Generate a very short (max 4 words) descriptive title for a chat that starts with: "${input.message}". Respond ONLY with the title.`;
            const titleRes = await invokeLLM({ messages: [{ role: "user", content: topicPrompt }] });
            const newTitle = titleRes.choices[0]?.message?.content.replace(/["']/g, "").substring(0, 50) || "Neural Thread";
            await db.update(aiConversations).set({ title: newTitle }).where(eq(aiConversations.id, conversationId!));
          }

          // Process Schedule Actions
          for (const action of actions) {
            if (action.action === "update") {
              await db.update(studySchedules).set({ 
                  ...(action.newTime && { scheduledTime: action.newTime }),
                  ...(action.newDuration && { duration: action.newDuration })
                }).where(and(eq(studySchedules.id, action.id), eq(studySchedules.userId, ctx.user.id)));
            } else if (action.action === "delete") {
              await db.delete(studySchedules).where(and(eq(studySchedules.id, action.id), eq(studySchedules.userId, ctx.user.id)));
            } else if (action.action === "add" && action.subject && action.newTime) {
              await db.insert(studySchedules).values({
                userId: ctx.user.id,
                subject: action.subject,
                scheduledTime: action.newTime,
                duration: action.newDuration || 60,
                completed: 0,
                createdAt: new Date().toISOString()
              });
            }
          }

          // Process New Knowledge (Training)
          for (const fact of newKnowledge) {
            await dbHelpers.saveAIKnowledge(ctx.user.id, fact);
          }

          // Save Message with conversationId
          await db.insert(aiChatHistory).values({
            userId: ctx.user.id,
            conversationId: conversationId!,
            message: input.message,
            response: aiResponse,
            topic: input.topic
          });
          
          await db.update(aiConversations).set({ updatedAt: new Date().toISOString() }).where(eq(aiConversations.id, conversationId!));
          await updateChallengeProgress(ctx.user.id, "ai_usage", 1);
          
          return { 
            response: aiResponse, 
            conversationId,
            actionsCount: actions.length,
            learnedSomething: newKnowledge.length > 0 
          };
        } catch (error: any) {
          console.error("AI CHAT ERROR:", error);
          return { response: "Neural pulse erratic. Try again.", actionsCount: 0 };
        }
      }),
    getHistory: protectedProcedure.input(z.object({ conversationId: z.number().optional() })).query(async ({ ctx, input }) => {
      if (input.conversationId) {
        return await db.select().from(aiChatHistory).where(and(eq(aiChatHistory.userId, ctx.user.id), eq(aiChatHistory.conversationId, input.conversationId))).orderBy(asc(aiChatHistory.createdAt));
      }
      return await dbHelpers.getUserAIChatHistory(ctx.user.id);
    }),
    getKnowledge: protectedProcedure.query(async ({ ctx }) => {
      return await dbHelpers.getUserAIKnowledge(ctx.user.id);
    }),
    deleteKnowledge: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.deleteAIKnowledge(input.id, ctx.user.id);
        return { success: true };
      }),
    generateQuiz: protectedProcedure
      .input(z.object({ sessionId: z.number(), content: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const prompt = `Generate exactly 5 high-quality MCQs from this content. Output MUST be ONLY a JSON array of objects with the exact structure: [{ "question": "...", "options": ["...", "...", "...", "..."], "answer": "...", "type": "MULTIPLE CHOICE", "weakness": "..." }].\n\nContent:\n${input.content.substring(0, 4000)}`;
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are an educational assessment AI. Always respond with ONLY a valid JSON array format. No markdown blocks around JSON, and no extra text." },
              { role: "user", content: prompt },
            ],
          });
          const content = response.choices[0]?.message?.content || "[]";
          const rawContent = typeof content === "string" ? content : String(content);
          const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
          return { quiz: JSON.parse(jsonMatch ? jsonMatch[0] : "[]") };
        } catch (error) {
          return { quiz: [], error: "Failed to generate quiz." };
        }
      }),

    generateMindmap: protectedProcedure
      .input(z.object({ content: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const prompt = `Analyze the following content and generate a mind map structure. Identify exactly 4 to 6 key related subtopics. Output MUST be ONLY a JSON array of objects: [{ "title": "...", "description": "..." }].\n\nContent:\n${input.content.substring(0, 4000)}`;
          const response = await invokeLLM({
             messages: [
               { role: "system", content: "You are a concept mapping AI. Respond ONLY with a valid JSON array. No markdown." },
               { role: "user", content: prompt }
             ]
          });
          const content = response.choices[0]?.message?.content || "[]";
          const rawContent = typeof content === "string" ? content : String(content);
          const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
          return { nodes: JSON.parse(jsonMatch ? jsonMatch[0] : "[]") };
        } catch (error) {
          return { nodes: [], error: "Failed to generate mindmap." };
        }
      }),

    generateFlashcards: protectedProcedure
      .input(z.object({ content: z.string() }))
      .mutation(async ({ input }) => {
         try {
           const prompt = `Create 5 to 8 spaced-repetition flashcards from the following content exploring its core facts and insights. Output MUST be ONLY a JSON array of objects: [{ "front": "Question/Term here", "back": "Answer/Definition here" }].\n\nContent:\n${input.content.substring(0, 4000)}`;
           const response = await invokeLLM({
             messages: [
               { role: "system", content: "You are an active-recall AI. Respond ONLY with a valid JSON array. No extra text." },
               { role: "user", content: prompt }
             ]
           });
           const content = response.choices[0]?.message?.content || "[]";
           const rawContent = typeof content === "string" ? content : String(content);
           const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
           return { cards: JSON.parse(jsonMatch ? jsonMatch[0] : "[]") };
         } catch (error) {
           return { cards: [], error: "Failed to generate flashcards." };
         }
      }),

    expandTopic: protectedProcedure
      .input(z.object({ topic: z.string() }))
      .mutation(async ({ input }) => {
         try {
           const prompt = `As a comprehensive Knowledge Base AI, write a highly detailed, extremely well-structured summary and explanation of the topic: "${input.topic}". Include its definition, core fundamentals, key theories, practical applications, and examples. It should be formatted as rich study material (ready to be used for generating quizzes and flashcards later). Make it about 500-1000 words.`;
           const response = await invokeLLM({
             messages: [
               { role: "system", content: "You are ZED Semantic Search Engine. You provide accurate, factual, and deeply educational study materials for topics." },
               { role: "user", content: prompt }
             ]
           });
           return { content: response.choices[0]?.message?.content || "No information found." };
         } catch(error) {
           return { content: "Knowledge retrieval connection failed. Could not process topic.", error: "Search failed" };
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
        aiTone: z.string().optional(),
        aiLanguage: z.string().optional(),
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

  // User Account Core
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
          streak: profile?.streak || 0
        };
      } catch (err) {
        return {
          id: ctx.user.id,
          userId: ctx.user.id,
          xp: 0,
          level: 1,
          name: ctx.user.name,
          username: ctx.user.username,
          email: ctx.user.email,
          avatar: null,
          profilePhoto: null,
          bio: null,
          streak: 0,
          levelTitle: 'Fresh Initiate',
          badges: [],
          activities: []
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

  // Legacy/Compat Routers
  gamification: router({
    getBadges: protectedProcedure.query(async ({ ctx }) => await dbHelpers.getUserBadges(ctx.user.id)),
  }),

  leaderboards: router({
    getGlobal: protectedProcedure.query(async () => {
      return await db.select({ id: users.id, name: users.name, username: users.username, xp: userProfiles.xp, level: userProfiles.level, avatar: userProfiles.profilePhoto }).from(users).innerJoin(userProfiles, eq(users.id, userProfiles.userId)).orderBy(desc(userProfiles.xp)).limit(50);
    }),
    getGroupMembers: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return await db.select({ 
        id: users.id, 
        name: users.name, 
        username: users.username, 
        xp: userProfiles.xp, 
        level: userProfiles.level, 
        avatar: userProfiles.profilePhoto,
        role: studyGroupMembers.role
      }).from(users)
      .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
      .innerJoin(studyGroupMembers, eq(users.id, studyGroupMembers.userId))
      .where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.status, "approved")))
      .orderBy(desc(userProfiles.xp));
    }),
    getSameLevel: protectedProcedure.query(async ({ ctx }) => {
      const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id));
      const level = profile?.level || 1;
      return await db.select({ id: users.id, name: users.name, username: users.username, xp: userProfiles.xp, level: userProfiles.level, avatar: userProfiles.profilePhoto }).from(users).innerJoin(userProfiles, eq(users.id, userProfiles.userId)).where(eq(userProfiles.level, level)).orderBy(desc(userProfiles.xp)).limit(50);
    }),
    getSquads: protectedProcedure.query(async () => {
        return [
          { id: 1, name: "Alpha Squad", memberCount: 5, totalXp: 12500, avatar: null },
          { id: 2, name: "Beta Team", memberCount: 3, totalXp: 8200, avatar: null }
        ];
    }),
  }),

  flashCards: router({
    createDeck: protectedProcedure
      .input(z.object({ title: z.string(), description: z.string().optional(), category: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await dbHelpers.createFlashCardDeck({ userId: ctx.user.id, title: input.title, description: input.description, category: input.category });
        return { success: true };
      }),
    getDecks: protectedProcedure.query(async ({ ctx }) => await dbHelpers.getUserFlashCardDecks(ctx.user.id)),
    addCard: protectedProcedure
      .input(z.object({ deckId: z.number(), question: z.string(), answer: z.string(), difficulty: z.enum(["easy", "medium", "hard"]).optional() }))
      .mutation(async ({ input }) => {
        await dbHelpers.addFlashCard(input);
        return { success: true };
      }),
    getCards: protectedProcedure.input(z.object({ deckId: z.number() })).query(async ({ input }) => await dbHelpers.getDeckFlashCards(input.deckId)),
  }),

  blockedWebsites: router({
    add: protectedProcedure.input(z.object({ domain: z.string(), reason: z.string().optional() })).mutation(async ({ ctx, input }) => {
      await dbHelpers.addBlockedWebsite({ userId: ctx.user.id, domain: input.domain, reason: input.reason });
      return { success: true };
    }),
    list: protectedProcedure.query(async ({ ctx }) => await dbHelpers.getUserBlockedWebsites(ctx.user.id)),
    remove: protectedProcedure.input(z.object({ websiteId: z.number() })).mutation(async ({ input }) => {
      await dbHelpers.removeBlockedWebsite(input.websiteId);
      return { success: true };
    }),
  }),

  community: router({
    createPost: protectedProcedure.input(z.object({ title: z.string(), content: z.string(), category: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const result = await db.insert(communityPosts).values({ 
        userId: ctx.user.id, 
        title: input.title, 
        content: input.content, 
        category: input.category || "general" 
      }).returning();
      const post = result[0];
      const postId = post?.id;
      
      // Notify users who have this author as a favorite friend
      try {
        const followers = await db.select({ userId: friends.userId }).from(friends).where(and(eq(friends.friendId, ctx.user.id), eq(friends.isFavorite, 1)));
        for (const follower of followers) {
          await db.insert(notifications).values({
            userId: follower.userId,
            fromUserId: ctx.user.id,
            postId: postId,
            type: 'friend_post' as any
          });
        }
      } catch (err) {
        console.error("Signal broadcast failed:", err);
      }
      
      return post || { success: true };
    }),
    getPosts: publicProcedure.query(async ({ ctx }) => {
      const posts = await dbHelpers.getAllCommunityPosts();
      return await Promise.all(posts.map(async (post) => {
        const user = await dbHelpers.getUserById(post.userId);
        const profile = await dbHelpers.getUserProfile(post.userId);
        const hasLiked = ctx.user ? await dbHelpers.hasUserLikedPost(post.id, ctx.user.id) : false;
        return { ...post, authorName: user?.name || 'Unknown', authorUsername: user?.username || 'unknown', authorAvatar: profile?.profilePhoto || null, hasLiked };
      }));
    }),
    getMyPosts: protectedProcedure.query(async ({ ctx }) => {
      const posts = await dbHelpers.getUserCommunityPosts(ctx.user.id);
      return await Promise.all(posts.map(async (post) => {
        const hasLiked = await dbHelpers.hasUserLikedPost(post.id, ctx.user.id);
        return { ...post, hasLiked };
      }));
    }),
    deletePost: protectedProcedure.input(z.object({ postId: z.number() })).mutation(async ({ ctx, input }) => {
      const post = await dbHelpers.getCommunityPost(input.postId);
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      if (post.userId !== ctx.user.id && ctx.user.role !== 'admin') throw new TRPCError({ code: "FORBIDDEN" });
      await dbHelpers.deleteCommunityPost(input.postId);
      return { success: true };
    }),
    likePost: protectedProcedure.input(z.object({ postId: z.number() })).mutation(async ({ ctx, input }) => {
      const alreadyLiked = await dbHelpers.hasUserLikedPost(input.postId, ctx.user.id);
      if (alreadyLiked) {
        await dbHelpers.unlikePost(input.postId, ctx.user.id);
      } else {
        await dbHelpers.likePost(input.postId, ctx.user.id);
        // Notify author
        const post = await dbHelpers.getCommunityPost(input.postId);
        if (post && post.userId !== ctx.user.id) {
          await db.insert(notifications).values({
            userId: post.userId,
            fromUserId: ctx.user.id,
            postId: input.postId,
            type: 'group_post_like' as any
          });
        }
      }
      return { success: true };
    }),
    addComment: protectedProcedure.input(z.object({ postId: z.number(), content: z.string() })).mutation(async ({ ctx, input }) => {
      await dbHelpers.addPostComment({ postId: input.postId, userId: ctx.user.id, content: input.content });
      const post = await dbHelpers.getCommunityPost(input.postId);
      if (post && post.userId !== ctx.user.id) {
        await db.insert(notifications).values({
          userId: post.userId,
          fromUserId: ctx.user.id,
          postId: input.postId,
          type: 'group_post_comment' as any
        });
      }
      return { success: true };
    }),
    getComments: publicProcedure.input(z.number()).query(async ({ input }) => await dbHelpers.getPostComments(input)),
  }),

  social: router({
    searchUsers: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
      if (!input.trim()) return [];
      return await db.select({ id: users.id, name: users.name, username: users.username, avatar: userProfiles.profilePhoto, xp: userProfiles.xp, level: userProfiles.level })
        .from(users).leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(and(or(like(users.username, `%${input}%`), like(users.name, `%${input}%`)), not(eq(users.id, ctx.user.id)))).limit(20);
    }),
    getPublicProfile: publicProcedure.input(z.number()).query(async ({ input }) => {
      const user = await dbHelpers.getUserById(input);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const profile = await dbHelpers.getUserProfile(input);
      const badges = await dbHelpers.getUserBadges(input);
      const activities = await db.select().from(userActivities).where(eq(userActivities.userId, input)).orderBy(desc(userActivities.createdAt)).limit(10);
      return { id: user.id, name: user.name, username: user.username, bio: profile?.bio, avatar: profile?.profilePhoto, xp: profile?.xp || 0, level: profile?.level || 1, badges, activities, profilePhoto: profile?.profilePhoto, streak: profile?.streak || 0, levelTitle: getLevelTitle(profile?.level || 1), status: profile?.status, avatarFrame: profile?.avatarFrame };
    }),

    getFriends: protectedProcedure.query(async ({ ctx }) => {
      const friendships = await db.select().from(friends)
        .where(
          and(
            or(eq(friends.userId, ctx.user.id), eq(friends.friendId, ctx.user.id)),
            eq(friends.status, 'accepted')
          )
        );
      
      const userFriends = await Promise.all(friendships.map(async (f) => {
        const otherId = f.userId === ctx.user.id ? f.friendId : f.userId;
        const [user] = await db.select().from(users).where(eq(users.id, otherId)).limit(1);
        const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, otherId)).limit(1);
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: profile?.profilePhoto || null,
          status: profile?.status || null,
          isFavorite: f.isFavorite
        };
      }));
      
      return userFriends.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }),

    getFriendRequests: protectedProcedure.query(async ({ ctx }) => {
      return await db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: userProfiles.profilePhoto
      })
      .from(friends)
      .innerJoin(users, eq(friends.userId, users.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(and(eq(friends.friendId, ctx.user.id), eq(friends.status, 'pending')));
    }),

    requestFriend: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      const existing = await db.select().from(friends).where(and(eq(friends.userId, ctx.user.id), eq(friends.friendId, input))).limit(1);
      if (existing.length > 0) return { success: true };
      await db.insert(friends).values({ userId: ctx.user.id, friendId: input, status: 'pending' });
      
      // Notify target user
      await db.insert(notifications).values({
        userId: input,
        fromUserId: ctx.user.id,
        type: 'friend_request' as any
      });
      
      return { success: true };
    }),

    acceptFriend: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      await db.update(friends).set({ status: 'accepted' }).where(and(eq(friends.userId, input), eq(friends.friendId, ctx.user.id)));
      // reciprocate friendship
      const reciprocated = await db.select().from(friends).where(and(eq(friends.userId, ctx.user.id), eq(friends.friendId, input))).limit(1);
      if (reciprocated.length === 0) {
        await db.insert(friends).values({ userId: ctx.user.id, friendId: input, status: 'accepted' });
      } else {
        await db.update(friends).set({ status: 'accepted' }).where(and(eq(friends.userId, ctx.user.id), eq(friends.friendId, input)));
      }
      
      // Notify requester (that their request was accepted)
      await db.insert(notifications).values({
        userId: input,
        fromUserId: ctx.user.id,
        type: 'friend_accept'
      });
      
      return { success: true };
    }),

    rejectFriend: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      // Delete the pending request
      await db.delete(friends).where(and(eq(friends.userId, input), eq(friends.friendId, ctx.user.id), eq(friends.status, 'pending')));
      
      // Notify requester (that their request was rejected)
      await db.insert(notifications).values({
        userId: input,
        fromUserId: ctx.user.id,
        type: 'friend_reject'
      });
      
      return { success: true };
    }),

    toggleFavorite: protectedProcedure.input(z.object({ friendId: z.number(), favorite: z.boolean() })).mutation(async ({ ctx, input }) => {
      await db.update(friends).set({ isFavorite: input.favorite ? 1 : 0 }).where(and(eq(friends.userId, ctx.user.id), eq(friends.friendId, input.friendId)));
      return { success: true };
    }),

    removeFriend: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      await db.delete(friends).where(or(and(eq(friends.userId, ctx.user.id), eq(friends.friendId, input)), and(eq(friends.userId, input), eq(friends.friendId, ctx.user.id))));
      return { success: true };
    }),
  }),

  messaging: router({
    sendMessage: protectedProcedure.input(z.object({ receiverId: z.number(), content: z.string() })).mutation(async ({ ctx, input }) => {
      await db.insert(directMessages).values({ senderId: ctx.user.id, receiverId: input.receiverId, content: input.content });
      return { success: true };
    }),
    getMessages: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
      return await db.select().from(directMessages).where(or(and(eq(directMessages.senderId, ctx.user.id), eq(directMessages.receiverId, input)), and(eq(directMessages.senderId, input), eq(directMessages.receiverId, ctx.user.id)))).orderBy(directMessages.createdAt);
    }),
    getConversations: protectedProcedure.query(async ({ ctx }) => {
        const sent = await db.select({ otherId: directMessages.receiverId }).from(directMessages).where(eq(directMessages.senderId, ctx.user.id));
        const received = await db.select({ otherId: directMessages.senderId }).from(directMessages).where(eq(directMessages.receiverId, ctx.user.id));
        const userIds = Array.from(new Set([...sent.map(s => s.otherId), ...received.map(r => r.otherId)]));
        if (userIds.length === 0) return [];
        return await db.select({ id: users.id, name: users.name, username: users.username, avatar: userProfiles.profilePhoto }).from(users).leftJoin(userProfiles, eq(users.id, userProfiles.userId)).where(inArray(users.id, userIds));
    }),
  }),

  groups: router({
    create: protectedProcedure.input(z.object({ name: z.string().min(3), description: z.string().optional(), isPublic: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
      const [result] = await db.insert(studyGroups).values({ name: input.name, description: input.description, creatorId: ctx.user.id, isPrivate: input.isPublic === false ? 1 : 0 }).returning({ id: studyGroups.id });
      await db.insert(studyGroupMembers).values({ groupId: result.id, userId: ctx.user.id, role: "admin", status: "approved" });
      return { groupId: result.id };
    }),
    listMyGroups: protectedProcedure.query(async ({ ctx }) => {
      return await db.select({ id: studyGroups.id, name: studyGroups.name, description: studyGroups.description, role: studyGroupMembers.role }).from(studyGroups).innerJoin(studyGroupMembers, eq(studyGroups.id, studyGroupMembers.groupId)).where(and(eq(studyGroupMembers.userId, ctx.user.id), eq(studyGroupMembers.status, "approved")));
    }),
    search: protectedProcedure.input(z.string()).query(async ({ input }) => {
      const results = await db.select().from(studyGroups).where(and(ilike(studyGroups.name, `%${input}%`), eq(studyGroups.isPrivate, 0)));
      return await Promise.all(results.map(async (g) => {
        const [members] = await db.select({ count: count() }).from(studyGroupMembers).where(eq(studyGroupMembers.groupId, g.id));
        return { ...g, memberCount: Number(members?.count || 0) };
      }));
    }),
    discover: protectedProcedure.query(async () => {
      const results = await db.select().from(studyGroups).where(eq(studyGroups.isPrivate, 0)).limit(20);
      return await Promise.all(results.map(async (g) => {
        const [members] = await db.select({ count: count() }).from(studyGroupMembers).where(eq(studyGroupMembers.groupId, g.id));
        return { ...g, memberCount: Number(members?.count || 0) };
      }));
    }),
    getGroup: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
      const [group] = await db.select().from(studyGroups).where(eq(studyGroups.id, input));
      if (!group) return null;
      const members = await db.select({ count: sql<number>`count(*)` }).from(studyGroupMembers).where(eq(studyGroupMembers.groupId, input));
      const [userMember] = await db.select().from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.userId, ctx.user.id)));
      
      return { 
        ...group, 
        memberCount: Number(members[0]?.count || 0), 
        role: userMember?.role || null, 
        status: userMember?.status || null,
        isMember: userMember?.status === 'approved'
      };
    }),
    requestJoin: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      const existing = await db.select().from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.userId, ctx.user.id)));
      if (existing.length > 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Already a member or request pending" });
      await db.insert(studyGroupMembers).values({ groupId: input, userId: ctx.user.id, role: "member", status: "pending" });
      
      // Notify group admin(s)
      try {
        const admins = await db.select({ userId: studyGroupMembers.userId }).from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.role, "admin")));
        for (const admin of admins) {
          await db.insert(notifications).values({
            userId: admin.userId,
            fromUserId: ctx.user.id,
            groupId: input,
            type: 'group_join_request' as any
          });
        }
      } catch (err) {
        console.error("Admin notification failed:", err);
      }
      
      return { success: true };
    }),
    getJoinRequests: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
      const [admin] = await db.select().from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.userId, ctx.user.id), eq(studyGroupMembers.role, "admin")));
      if (!admin) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.select({ id: users.id, name: users.name, username: users.username, avatar: userProfiles.profilePhoto }).from(users).innerJoin(studyGroupMembers, eq(users.id, studyGroupMembers.userId)).leftJoin(userProfiles, eq(users.id, userProfiles.userId)).where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.status, "pending")));
    }),
    handleJoinRequest: protectedProcedure.input(z.object({ groupId: z.number(), userId: z.number(), action: z.enum(["approve", "reject"]) })).mutation(async ({ ctx, input }) => {
      const [admin] = await db.select().from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input.groupId), eq(studyGroupMembers.userId, ctx.user.id), eq(studyGroupMembers.role, "admin")));
      if (!admin) throw new TRPCError({ code: "FORBIDDEN" });

      if (input.action === "approve") {
        await db.update(studyGroupMembers).set({ status: "approved" }).where(and(eq(studyGroupMembers.groupId, input.groupId), eq(studyGroupMembers.userId, input.userId)));
        
        // Notify user of acceptance
        await db.insert(notifications).values({
          userId: input.userId,
          fromUserId: ctx.user.id,
          groupId: input.groupId,
          type: 'group_join_accept' as any
        });
      } else {
        await db.delete(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input.groupId), eq(studyGroupMembers.userId, input.userId)));
        
        // Notify user of rejection
        await db.insert(notifications).values({
          userId: input.userId,
          fromUserId: ctx.user.id,
          groupId: input.groupId,
          type: 'group_join_reject' as any
        });
      }
      return { success: true };
    }),
    joinViaInvite: protectedProcedure.input(z.object({ groupId: z.number() })).mutation(async ({ ctx, input }) => {
      // Instant join logic for invitees
      const existing = await db.select().from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input.groupId), eq(studyGroupMembers.userId, ctx.user.id)));
      if (existing.length > 0) {
        if (existing[0].status === "approved") return { success: true, alreadyMember: true };
        await db.update(studyGroupMembers).set({ status: "approved" }).where(and(eq(studyGroupMembers.groupId, input.groupId), eq(studyGroupMembers.userId, ctx.user.id)));
      } else {
        await db.insert(studyGroupMembers).values({ groupId: input.groupId, userId: ctx.user.id, role: "member", status: "approved" });
      }
      return { success: true };
    }),
  }),

  groupContent: router({
    getFeed: protectedProcedure.input(z.number()).query(async ({ input }) => {
      const [member] = await db.select().from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input), eq(studyGroupMembers.userId, ctx.user.id), eq(studyGroupMembers.status, "approved")));
      if (!member) {
        return []; // Restricted view: no feed content for non-members
      }
      return await db.select({ id: studyGroupPosts.id, title: studyGroupPosts.title, content: studyGroupPosts.content, createdAt: studyGroupPosts.createdAt, authorName: users.name }).from(studyGroupPosts).innerJoin(users, eq(studyGroupPosts.userId, users.id)).where(eq(studyGroupPosts.groupId, input)).orderBy(desc(studyGroupPosts.createdAt));
    }),
    getTasks: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await db.select().from(studyGroupTasks).where(eq(studyGroupTasks.groupId, input)).orderBy(desc(studyGroupTasks.createdAt));
    }),
    getChatMessages: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await db.select({
            id: studyGroupMessages.id,
            groupId: studyGroupMessages.groupId,
            userId: studyGroupMessages.userId,
            content: studyGroupMessages.content,
            createdAt: studyGroupMessages.createdAt,
            authorName: users.name,
            authorUsername: users.username,
            authorAvatar: userProfiles.profilePhoto
        }).from(studyGroupMessages)
        .innerJoin(users, eq(studyGroupMessages.userId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(eq(studyGroupMessages.groupId, input))
        .orderBy(studyGroupMessages.createdAt);
    }),
    createPost: protectedProcedure.input(z.object({ groupId: z.number(), title: z.string(), content: z.string() })).mutation(async ({ ctx, input }) => {
        const [post] = await db.insert(studyGroupPosts).values({ groupId: input.groupId, userId: ctx.user.id, title: input.title, content: input.content }).returning();
        
        // Notify all members of the group
        const members = await db.select({ userId: studyGroupMembers.userId }).from(studyGroupMembers).where(and(eq(studyGroupMembers.groupId, input.groupId), eq(studyGroupMembers.status, "approved"), not(eq(studyGroupMembers.userId, ctx.user.id))));
        for (const member of members) {
            await db.insert(notifications).values({
                userId: member.userId,
                fromUserId: ctx.user.id,
                groupPostId: post.id,
                type: 'friend_post' as any // Reusing friend_post for now or can use group_post if added
            });
        }
        return { success: true };
    }),
    sendChatMessage: protectedProcedure.input(z.object({ groupId: z.number(), content: z.string() })).mutation(async ({ ctx, input }) => {
        await db.insert(studyGroupMessages).values({ groupId: input.groupId, userId: ctx.user.id, content: input.content });
        return { success: true };
    }),
    likePost: protectedProcedure.input(z.object({ postId: z.number() })).mutation(async ({ ctx, input }) => {
        const existing = await db.select().from(studyGroupPostLikes).where(and(eq(studyGroupPostLikes.postId, input.postId), eq(studyGroupPostLikes.userId, ctx.user.id)));
        if (existing.length > 0) {
            await db.delete(studyGroupPostLikes).where(and(eq(studyGroupPostLikes.postId, input.postId), eq(studyGroupPostLikes.userId, ctx.user.id)));
            await db.update(studyGroupPosts).set({ likes: sql`${studyGroupPosts.likes} - 1` }).where(eq(studyGroupPosts.id, input.postId));
        } else {
            await db.insert(studyGroupPostLikes).values({ postId: input.postId, userId: ctx.user.id });
            await db.update(studyGroupPosts).set({ likes: sql`${studyGroupPosts.likes} + 1` }).where(eq(studyGroupPosts.id, input.postId));
            
            const [post] = await db.select().from(studyGroupPosts).where(eq(studyGroupPosts.id, input.postId));
            if (post && post.userId !== ctx.user.id) {
                await db.insert(notifications).values({
                    userId: post.userId,
                    fromUserId: ctx.user.id,
                    groupPostId: post.id,
                    type: 'group_post_like' as any
                });
            }
        }
        return { success: true };
    }),
    addComment: protectedProcedure.input(z.object({ postId: z.number(), content: z.string() })).mutation(async ({ ctx, input }) => {
        await db.insert(studyGroupPostComments).values({ postId: input.postId, userId: ctx.user.id, content: input.content });
        const [post] = await db.select().from(studyGroupPosts).where(eq(studyGroupPosts.id, input.postId));
        if (post && post.userId !== ctx.user.id) {
            await db.insert(notifications).values({
                userId: post.userId,
                fromUserId: ctx.user.id,
                groupPostId: post.id,
                type: 'group_post_comment' as any
            });
        }
        return { success: true };
    }),
    getComments: protectedProcedure.input(z.number()).query(async ({ input }) => {
        return await db.select({ 
            id: studyGroupPostComments.id, 
            content: studyGroupPostComments.content, 
            createdAt: studyGroupPostComments.createdAt, 
            authorName: users.name, 
            authorAvatar: userProfiles.profilePhoto 
        })
        .from(studyGroupPostComments)
        .innerJoin(users, eq(studyGroupPostComments.userId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(eq(studyGroupPostComments.postId, input))
        .orderBy(asc(studyGroupPostComments.createdAt));
    }),
  }),
});

export type AppRouter = typeof appRouter;
