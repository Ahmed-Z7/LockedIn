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
      // Return default profile if not found
      if (!profile) {
        return {
          id: 0,
          userId: ctx.user.id,
          bio: null,
          avatar: null,
          xp: 0,
          level: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
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
                content: "You are LOCKEDIN's AI Study Coach. Help students learn effectively with personalized guidance, explanations, and study strategies. Be encouraging and supportive.",
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

  // Community Posts
  community: router({
    createPost: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createCommunityPost({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          category: input.category || "general",
        });
        return { success: true };
      }),

    getPosts: publicProcedure.query(async () => {
      const posts = await db.getAllCommunityPosts();
      // Enrich posts with user data
      const enrichedPosts = await Promise.all(
        posts.map(async (post: any) => {
          const user = await db.getUserById(post.userId);
          const profile = await db.getUserProfile(post.userId);
          return {
            ...post,
            authorName: user?.name || 'Unknown',
            authorUsername: user?.username || 'unknown',
            authorAvatar: profile?.profilePhoto || null,
          };
        })
      );
      return enrichedPosts;
    }),

    getMyPosts: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCommunityPosts(ctx.user.id);
    }),

    updatePost: protectedProcedure
      .input(z.object({
        postId: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateCommunityPost(input.postId, {
          title: input.title,
          content: input.content,
        });
        return { success: true };
      }),

    deletePost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCommunityPost(input.postId);
        return { success: true };
      }),

    likePost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.likePost(input.postId, ctx.user.id);
        return { success: true };
      }),

    unlikePost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unlikePost(input.postId, ctx.user.id);
        return { success: true };
      }),

    hasLiked: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.hasUserLikedPost(input.postId, ctx.user.id);
      }),

    // Comments
    addComment: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addPostComment({
          postId: input.postId,
          userId: ctx.user.id,
          content: input.content,
          createdAt: new Date(),
        });
        // Create notification for post author
        const post = await db.getCommunityPost(input.postId);
        if (post && post.userId !== ctx.user.id) {
          await db.createNotification({
            userId: post.userId,
            type: 'comment',
            fromUserId: ctx.user.id,
            postId: input.postId,
            createdAt: new Date(),
          });
        }
        return { success: true };
      }),

    getComments: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        const comments = await db.getPostComments(input.postId);
        // Enrich comments with user data
        const enrichedComments = await Promise.all(
          comments.map(async (comment: any) => {
            const user = await db.getUserById(comment.userId);
            const profile = await db.getUserProfile(comment.userId);
            return {
              ...comment,
              authorName: user?.name || 'Unknown',
              authorUsername: user?.username || 'unknown',
              authorAvatar: profile?.profilePhoto || null,
            };
          })
        );
        return enrichedComments;
      }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserNotifications(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
  }),

  // User Profile Update
  user: router({
    updateName: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserName(ctx.user.id, input.name);
        return { success: true };
      }),

    updateProfilePhoto: protectedProcedure
      .input(z.object({ photoBase64: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateProfilePhoto(ctx.user.id, input.photoBase64);
        return { success: true };
      }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getUserProfile(ctx.user.id);
      const user = await db.getUserById(ctx.user.id);
      return {
        ...profile,
        username: user?.username,
        name: user?.name,
        email: user?.email,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
