import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import * as db from "./db";

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
  }),

  // User Profile
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getUserProfile(ctx.user.id);
      return profile;
    }),
    
    update: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        avatar: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createOrUpdateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Gamification
  gamification: router({
    addXP: protectedProcedure
      .input(z.object({ amount: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addXP(ctx.user.id, input.amount);
        return { success: true };
      }),

    getBadges: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBadges(ctx.user.id);
    }),

    addBadge: protectedProcedure
      .input(z.object({
        badgeName: z.string(),
        badgeIcon: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addBadge(ctx.user.id, input.badgeName, input.badgeIcon, input.description);
        return { success: true };
      }),
  }),

  // Study Sessions
  studySessions: router({
    create: protectedProcedure
      .input(z.object({
        subject: z.string(),
        duration: z.number(),
        focusScore: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createStudySession({
          userId: ctx.user.id,
          subject: input.subject,
          duration: input.duration,
          focusScore: input.focusScore,
          startTime: new Date(),
          notes: input.notes,
        });
        // Award XP for completing a study session
        await db.addXP(ctx.user.id, Math.floor(input.duration / 10));
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserStudySessions(ctx.user.id);
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
        await db.createFlashCardDeck({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
        });
        return { success: true };
      }),

    getDecks: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserFlashCardDecks(ctx.user.id);
    }),

    addCard: protectedProcedure
      .input(z.object({
        deckId: z.number(),
        question: z.string(),
        answer: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addFlashCard({
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
        return await db.getDeckFlashCards(input.deckId);
      }),
  }),

  // Study Schedule
  schedule: router({
    create: protectedProcedure
      .input(z.object({
        subject: z.string(),
        scheduledTime: z.date(),
        duration: z.number(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createStudySchedule({
          userId: ctx.user.id,
          subject: input.subject,
          scheduledTime: input.scheduledTime,
          duration: input.duration,
          priority: input.priority,
        });
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserStudySchedules(ctx.user.id);
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
        await db.addBlockedWebsite({
          userId: ctx.user.id,
          domain: input.domain,
          reason: input.reason,
        });
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBlockedWebsites(ctx.user.id);
    }),

    remove: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeBlockedWebsite(input.websiteId);
        return { success: true };
      }),
  }),

  // AI Study Coach
  aiCoach: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        topic: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are AuraLearn's AI Study Coach. Help students learn effectively with personalized guidance, explanations, and study strategies. Be encouraging and supportive.",
              },
              {
                role: "user",
                content: input.message,
              },
            ],
          });

          const content = response.choices[0]?.message?.content;
          const aiResponse = typeof content === 'string' ? content : "I couldn't generate a response. Please try again.";
          
          // Save chat history
          if (typeof aiResponse === 'string') {
            await db.saveAIChatMessage(ctx.user.id, input.message, aiResponse, input.topic);
          }
          
          return { response: aiResponse };
        } catch (error) {
          console.error("AI Coach Error:", error);
          return { response: "I encountered an error. Please try again later." };
        }
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAIChatHistory(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
