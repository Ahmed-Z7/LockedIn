import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from './db';
import { 
  users, userProfiles, studySessions, studyMaterials, studySchedules, 
  challenges, userChallenges, userBadges, userActivities,
  notifications, userSettings, aiChatHistory, aiConversations, 
  userAIKnowledge, friends
} from '../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { invokeLLM } from './_core/llm';
import superjson from 'superjson';

// Define context type for type-safety
interface Context {
  user?: { id: number; email: string; name: string };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next() as any;
});

// Helper for streak updates
async function updateStreak(userId: number) {
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
  if (!profile) return;

  const today = new Date().toISOString().split('T')[0];
  const lastStudy = profile.lastStudyDate?.split('T')[0];

  if (lastStudy === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreakSize = profile.streak;
  if (lastStudy === yesterdayStr) {
    newStreakSize += 1;
  } else {
    newStreakSize = 1;
  }

  await db.update(userProfiles)
    .set({ 
      streak: newStreakSize,
      streakLongest: Math.max(newStreakSize, profile.streakLongest),
      lastStudyDate: new Date().toISOString()
    })
    .where(eq(userProfiles.userId, userId));
}

const MOCK_CHALLENGES = [
  { id: 1, title: "Neural Beginner", description: "Complete your first study session", category: "study_time", targetValue: 1, currentProgress: 0, completed: 0, difficulty: "easy", rewardXp: 100 },
  { id: 2, title: "Focus Master", description: "Maintain 90% focus for 1 hour", category: "focus", targetValue: 60, currentProgress: 0, completed: 0, difficulty: "medium", rewardXp: 250 },
  { id: 3, title: "Streak Starter", description: "3 day study streak", category: "streak", targetValue: 3, currentProgress: 0, completed: 0, difficulty: "easy", rewardXp: 150 },
];

export const appRouter = router({
  // Auth & Account
  userAccount: router({
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user!.id));
        return profile;
      }),
    updateProfile: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        status: z.string().optional(),
        avatarFrame: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const [updated] = await db.update(userProfiles)
          .set({ ...input, updatedAt: new Date().toISOString() })
          .where(eq(userProfiles.userId, ctx.user!.id))
          .returning();
        return updated;
      }),
    updatePhoto: protectedProcedure
      .input(z.object({ photo: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const [updated] = await db.update(userProfiles)
          .set({ profilePhoto: input.photo, updatedAt: new Date().toISOString() })
          .where(eq(userProfiles.userId, ctx.user!.id))
          .returning();
        return updated;
      }),
  }),

  // Social Router
  social: router({
    getFriends: protectedProcedure
      .query(async ({ ctx }) => {
        const userFriends = await db.select({
          id: friends.id,
          friendId: friends.friendId,
          status: friends.status,
          isFavorite: friends.isFavorite,
          name: users.name,
          photo: userProfiles.profilePhoto,
          xp: userProfiles.xp,
          rank: userProfiles.rank,
        })
        .from(friends)
        .innerJoin(users, eq(friends.friendId, users.id))
        .innerJoin(userProfiles, eq(friends.friendId, userProfiles.userId))
        .where(eq(friends.userId, ctx.user!.id));
        return userFriends;
      }),
    addFriend: protectedProcedure
      .input(z.object({ friendId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.insert(friends).values({
          userId: ctx.user!.id,
          friendId: input.friendId,
          status: 'accepted'
        });
        // Symmetric friendship
        await db.insert(friends).values({
          userId: input.friendId,
          friendId: ctx.user!.id,
          status: 'accepted'
        });
        return { success: true };
      }),
  }),

  // Progression & Gamification
  progression: router({
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        await updateStreak(ctx.user!.id);
        const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user!.id));
        const badges = await db.select().from(userBadges).where(eq(userBadges.userId, ctx.user!.id));
        const activities = await db.select().from(userActivities).where(eq(userActivities.userId, ctx.user!.id)).orderBy(desc(userActivities.createdAt)).limit(10);
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
            .leftJoin(userChallenges, and(eq(userChallenges.challengeId, challenges.id), eq(userChallenges.userId, ctx.user!.id)));

          if (userChallengesList.length === 0) return MOCK_CHALLENGES;

          return userChallengesList.map(c => ({
            ...c,
            currentProgress: c.currentProgress ?? 0,
            completed: c.completed ?? 0,
          }));
        } catch (err: any) {
          return MOCK_CHALLENGES;
        }
      }),
  }),

  // Study Router
  study: router({
    uploadMaterial: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string().optional(),
        type: z.string(),
        fileUrl: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const [material] = await db.insert(studyMaterials).values({
          userId: ctx.user!.id,
          title: input.title,
          content: input.content || "",
          type: input.type,
          fileUrl: input.fileUrl || "",
          createdAt: new Date().toISOString()
        }).returning();
        return material;
      }),

    analyzeMaterial: protectedProcedure
      .input(z.object({
        content: z.string(),
        days: z.number().min(1).max(30),
        hoursPerDay: z.number().min(1).max(12)
      }))
      .mutation(async ({ input }) => {
        try {
          const isSparse = input.content.length < 50;
          const prompt = isSparse 
            ? `RESEARCH & EXPAND: Topic: "${input.content}". Days: ${input.days}. Hours: ${input.hoursPerDay}. 
               Return JSON array: [{ "title": "Academic Sub-topic", "difficulty": "easy/medium/hard", "duration": 60 }] 
               STRICT RULE: Focus ONLY on academic concepts. Respond with ONLY the JSON array.`
            : `ANALYZE MATERIAL: Content: "${input.content.substring(0, 8000)}". 
               Split into study tasks over ${input.days} days, ${input.hoursPerDay} hours/day.
               Return JSON array: [{ "title": "Concept from Content", "difficulty": "easy/medium/hard", "duration": 45 }]
               STRICT RULE: NO study techniques. FOCUS ONLY ON SUBJECT MATTER. Respond with ONLY the JSON array.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Academic AI Engine. Return ONLY JSON arrays." },
              { role: "user", content: prompt },
            ],
          });

          const raw = response.choices[0]?.message?.content || "[]";
          const jsonMatch = raw.match(/\[[\s\S]*\]/);
          const topics = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
          return { topics: topics.length > 0 ? topics : [{ title: 'Subject Fundamentals', difficulty: 'medium', duration: 60 }] };
        } catch (error) {
          return { topics: [{ title: 'Neural Overview', difficulty: 'medium', duration: 45 }] };
        }
      }),

    savePlan: protectedProcedure
      .input(z.object({
        materialId: z.number(),
        sessions: z.array(z.object({
          subject: z.string(),
          scheduledTime: z.string(),
          duration: z.number(),
          priority: z.string(),
          difficulty: z.string(),
          sessionType: z.string()
        }))
      }))
      .mutation(async ({ ctx, input }) => {
        const inserts = input.sessions.map(s => ({
          userId: ctx.user!.id,
          materialId: input.materialId,
          ...s,
          createdAt: new Date().toISOString()
        }));
        return await db.insert(studySchedules).values(inserts).returning();
      }),

    getSchedule: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.select().from(studySchedules).where(eq(studySchedules.userId, ctx.user!.id)).orderBy(desc(studySchedules.scheduledTime));
      }),

    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
         const [session] = await db
           .select()
           .from(studySchedules)
           .where(and(eq(studySchedules.id, input.sessionId), eq(studySchedules.userId, ctx.user!.id)))
           .limit(1);
         
         if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

         const [material] = await db
           .select()
           .from(studyMaterials)
           .where(eq(studyMaterials.id, session.materialId || 0))
           .limit(1);

         return { ...session, material };
      }),

    updateSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        completed: z.number(),
        focusScore: z.number().optional(),
        distractions: z.number().optional(),
        isLocked: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const [updated] = await db.update(studySchedules)
          .set({ 
            completed: input.completed, 
            focusScore: input.focusScore || 0,
            updatedAt: new Date().toISOString()
          })
          .where(and(eq(studySchedules.id, input.sessionId), eq(studySchedules.userId, ctx.user!.id)))
          .returning();
        
        if (input.completed === 1) {
           // Basic XP reward
           await db.update(userProfiles)
             .set({ xp: sql`${userProfiles.xp} + 100` })
             .where(eq(userProfiles.userId, ctx.user!.id));
        }

        return updated;
      }),
  }),

  // AI Coach Router
  aiCoach: router({
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.select().from(aiConversations).where(eq(aiConversations.userId, ctx.user!.id)).orderBy(desc(aiConversations.updatedAt));
      }),

    createConversation: protectedProcedure
      .mutation(async ({ ctx }) => {
        const [conv] = await db.insert(aiConversations).values({
          userId: ctx.user!.id,
          title: "New Neural Thread",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }).returning();
        return conv;
      }),

    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        conversationId: z.number().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, ctx.user!.id));
        const knowledge = await db.select().from(userAIKnowledge).where(eq(userAIKnowledge.userId, ctx.user!.id));
        
        const contextPrompt = `You are ZED, the ultimate AI study coach.
          User Profile: ${settings?.aiTone || 'friendly'} tone, ${settings?.aiLanguage || 'bilingual'}.
          Personal Facts Found: ${knowledge.map(k => k.content).join(', ')}.
          Current Message: ${input.message}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are ZED, an empathetic and highly efficient study coach." },
            { role: "user", content: contextPrompt }
          ]
        });

        const reply = response.choices[0]?.message?.content || "Neural pulse weak. Try again.";

        // Basic persistent memory logic
        let learnedSomething = false;
        if (input.message.toLowerCase().includes("i prefer") || input.message.toLowerCase().includes("i study best")) {
          await db.insert(userAIKnowledge).values({
            userId: ctx.user!.id,
            content: input.message,
            category: 'preference',
            createdAt: new Date().toISOString()
          });
          learnedSomething = true;
        }

        return { response: reply, learnedSomething };
      }),

    generateQuiz: protectedProcedure
      .input(z.object({ sessionId: z.number(), content: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const prompt = `EXAM PROTOCOL: Topic: ${input.content.substring(0, 5000)}. 
          Generate exactly 5 high-quality MCQs. 
          STRICT RULES:
          1. Focus 100% on ACTUAL ACADEMIC CONCEPTS from the content.
          2. DO NOT ask about study habits or techniques.
          3. Return JSON array: [{ "question": "string", "options": ["A","B","C","D"], "answer": "Exact String", "type": "MULTIPLE CHOICE", "weakness": "explanation" }]`;
          
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Academic Examiner AI. ONLY JSON." },
              { role: "user", content: prompt },
            ],
          });
          const raw = response.choices[0]?.message?.content || "[]";
          const jsonMatch = raw.match(/\[[\s\S]*\]/);
          return { quiz: JSON.parse(jsonMatch ? jsonMatch[0] : "[]") };
        } catch (error) {
          return { quiz: [] };
        }
      }),

    generateFlashCards: protectedProcedure
      .input(z.object({ content: z.string(), subject: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const prompt = `FLASHCARD GENERATION: Subject: "${input.subject}". Content: ${input.content.substring(0, 5000)}.
          Generate 8 flashcards. STRICT RULE: ACADEMIC FACTS ONLY.
          Return ONLY JSON array: [{ "front": "Question", "back": "Answer" }]`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Academic AI. ONLY JSON." },
              { role: "user", content: prompt },
            ],
          });
          const raw = response.choices[0]?.message?.content || "[]";
          const jsonMatch = raw.match(/\[[\s\S]*\]/);
          return { cards: JSON.parse(jsonMatch ? jsonMatch[0] : "[]") };
        } catch (e) {
          return { cards: [] };
        }
      }),

    generateMindMap: protectedProcedure
      .input(z.object({ content: z.string(), subject: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const prompt = `MIND MAP: Subject "${input.subject}". Content: ${input.content.substring(0, 5000)}.
          STRICT RULE: ACADEMIC CONCEPTS ONLY.
          Return ONLY JSON: { "center": "Core Topic", "branches": [{ "title": "Branch", "nodes": ["detail"] }] }`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Mapping Engine. ONLY JSON." },
              { role: "user", content: prompt },
            ],
          });
          const raw = response.choices[0]?.message?.content || "{}";
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          return { mindmap: JSON.parse(jsonMatch ? jsonMatch[0] : "{}") };
        } catch (e) {
          return { mindmap: null };
        }
      }),

    generateSummary: protectedProcedure
      .input(z.object({ content: z.string(), subject: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const prompt = `ACADEMIC SUMMARY: Topic "${input.subject}". Content: ${input.content.substring(0, 6000)}.
          STRICT RULE: FACTS ONLY.
          Return ONLY JSON: { "overview": "string", "keyPoints": ["point"], "conclusion": "string" }`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Scientific Summarizer. ONLY JSON." },
              { role: "user", content: prompt },
            ],
          });
          const raw = response.choices[0]?.message?.content || "{}";
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          return { summary: JSON.parse(jsonMatch ? jsonMatch[0] : "{}") };
        } catch (e) {
          return { summary: null };
        }
      }),
  }),

  // Notifications
  notifications: router({
    getSettings: protectedProcedure.query(async ({ ctx }) => {
      const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, ctx.user!.id));
      return settings || { aiTone: 'friendly', aiLanguage: 'bilingual' };
    }),
    updateSettings: protectedProcedure
      .input(z.record(z.any()))
      .mutation(async ({ ctx, input }) => {
        return await db.update(userSettings).set(input).where(eq(userSettings.userId, ctx.user!.id)).returning();
      }),
  }),
});

export type AppRouter = typeof appRouter;
