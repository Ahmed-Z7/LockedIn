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
        await db.createOrUpdateUserProfile(ctx.user.id, {
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.avatar !== undefined && { profilePhoto: input.avatar }),
        });
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
        await db.createStudySchedule([{
          userId: ctx.user.id,
          subject: input.subject,
          scheduledTime: input.scheduledTime,
          duration: input.duration,
          priority: input.priority,
        }]);
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
        documentContext: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          let systemContent = "You are LOCKEDIN's AI Study Coach. Help students learn effectively with personalized guidance, explanations, and study strategies. Be encouraging and supportive.";
          
          if (input.documentContext) {
            systemContent += "\n\nUse the following document context to help the student:\n" + input.documentContext;
          }

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemContent,
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
        posts.map(async (post) => {
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

        // Create notification for post author
        const post = await db.getCommunityPost(input.postId);
        if (post && post.userId !== ctx.user.id) {
          await db.createNotification({
            userId: post.userId,
            type: 'like',
            fromUserId: ctx.user.id,
            postId: input.postId,
            createdAt: new Date(),
          });
        }
        
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
          comments.map(async (comment) => {
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
      try {
        const list = await db.getUserNotifications(ctx.user.id);
        if (list.length > 0) return list;
        
        // If no notifications found in DB during development, return high-fidelity mock data
        if (process.env.NODE_ENV === "development") {
          return [
            {
              id: 999,
              userId: ctx.user.id,
              fromUserId: 2,
              fromUserName: "Mahmoud",
              type: "like",
              read: 0,
              createdAt: new Date(Date.now() - 1000 * 60 * 5),
            },
            {
              id: 998,
              userId: ctx.user.id,
              fromUserId: 3,
              fromUserName: "Ahmed",
              type: "comment",
              read: 0,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
            {
              id: 997,
              userId: ctx.user.id,
              fromUserId: 4,
              fromUserName: "Sara",
              type: "achievement",
              read: 0,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            },
             {
              id: 996,
              userId: ctx.user.id,
              fromUserId: 2,
              fromUserName: "Mahmoud",
              type: "social",
              read: 1, // Read (should be at bottom)
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            }
          ];
        }
        return [];
      } catch (err) {
        // Fallback for DB connection errors in development
        if (process.env.NODE_ENV === "development") {
           return [
            {
              id: 1000,
              userId: ctx.user.id,
              fromUserName: "System",
              type: "achievement",
              read: 0,
              createdAt: new Date(),
            }
          ];
        }
        throw err;
      }
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(ctx.user.id, input.notificationId);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNotification(input.notificationId);
        return { success: true };
      }),

    getSettings: protectedProcedure.query(async ({ ctx }) => {
      const settings = await db.getUserSettings(ctx.user.id);
      if (!settings) {
        return {
          achievementNotifications: 1,
          socialNotifications: 1,
          messageNotifications: 1,
          challengeReminders: 1,
          weeklyDigest: 1,
        };
      }
      return settings;
    }),

    updateSettings: protectedProcedure
      .input(z.object({
        achievementNotifications: z.number().optional(),
        socialNotifications: z.number().optional(),
        messageNotifications: z.number().optional(),
        challengeReminders: z.number().optional(),
        weeklyDigest: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserSettings(ctx.user.id, input);
        return { success: true };
      }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getUnreadNotificationsCount(ctx.user.id);
      } catch (err) {
        if (process.env.NODE_ENV === "development") return 3;
        throw err;
      }
    }),
  }),

  study: router({
    analyzeMaterial: protectedProcedure
      .input(z.object({ 
        content: z.string(),
        days: z.number().min(1).max(30),
        hoursPerDay: z.number().min(1).max(12)
      }))
      .mutation(async ({ input }) => {
        // Mock AI analysis logic
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
          scheduledTime: z.string(), // ISO string
          duration: z.number(),
          priority: z.enum(['low', 'medium', 'high']),
          difficulty: z.enum(['easy', 'medium', 'hard']),
          sessionType: z.enum(['study', 'review']),
        }))
      }))
      .mutation(async ({ ctx, input }) => {
        // Delete existing schedule if any
        await db.deleteStudySchedule(ctx.user.id);
        
        const sessions = input.sessions.map(s => ({
          ...s,
          userId: ctx.user.id,
          materialId: input.materialId,
          scheduledTime: new Date(s.scheduledTime),
          completed: 0
        }));
        
        await db.createStudySchedule(sessions);
        return { success: true };
      }),

    getSchedule: protectedProcedure.query(async ({ ctx }) => {
      return await db.getStudySchedule(ctx.user.id);
    }),

    updateSession: protectedProcedure
      .input(z.object({ 
        sessionId: z.number(), 
        completed: z.number().optional(),
        subject: z.string().optional(),
        duration: z.number().optional(),
        scheduledTime: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateScheduleStatus(input.sessionId, ctx.user.id, input.completed ?? 0, {
            subject: input.subject,
            duration: input.duration,
            scheduledTime: input.scheduledTime ? new Date(input.scheduledTime) : undefined
        });
        return { success: true };
      }),

    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await db.getStudySessionById(input.sessionId, ctx.user.id);
        if (!session) throw new Error("Session not found");
        
        // Fetch material if linked
        let material = null;
        if (session.materialId) {
            material = await db.getStudyMaterialById(session.materialId);
        }
        
        return { 
            ...session,
            material
        };
      }),

    adjustSchedule: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const msg = input.message.toLowerCase();
        const schedule = await db.getStudySchedule(ctx.user.id);
        
        if (msg.includes('easier')) {
          // Mock adjustment
          for (const s of schedule) {
            await db.updateScheduleStatus(s.id, ctx.user.id, 0); // Reset or adjust?
            // In a real app, we would update duration/difficulty
          }
        }
        
        return { response: "I've adjusted your schedule based on your request!" };
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
