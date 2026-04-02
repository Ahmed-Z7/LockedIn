import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, sql, and } from "drizzle-orm";
//import { drizzle } from "drizzle-orm/mysql2";



import {
  users, InsertUser,
  userProfiles, InsertUserProfile,
  userBadges, InsertUserBadge,
  studySessions, InsertStudySession,
  flashCardDecks, InsertFlashCardDeck,
  flashCards, InsertFlashCard,
  studySchedules, InsertStudySchedule,
  blockedWebsites, InsertBlockedWebsite,
  aiChatHistory, InsertAIChatHistory,
  communityPosts, InsertCommunityPost,
  postComments, InsertPostComment,
  postLikes, InsertPostLike,
  notifications, InsertNotification,
  userSettings, InsertUserSetting,
  studyMaterials, InsertStudyMaterial
} from "../drizzle/schema";
import { ENV } from './_core/env';


export const sqlConnection = neon(process.env.DATABASE_URL!);
export const db = drizzle(sqlConnection);



// Lazily create the drizzle instance (legacy helper)
export async function getDb() {
  return db;
}

// Generate username from email
function generateUsername(email: string): string {
  if (!email) return `user_${Date.now()}`;
  const emailName = email.split('@')[0];
  return emailName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Generate username from email if not provided
    const username = user.username || (user.email ? generateUsername(user.email) : `user_${Date.now()}`);

    const values: InsertUser = {
      openId: user.openId,
      username: username,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date().toISOString();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: [users.openId],
      set: updateSet,
    });


  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// User Profile Functions
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateUserProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserProfile(userId);
  if (existing) {
    await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, ...data });
  }
}

export async function addXP(userId: number, xpAmount: number) {
  const dbStatus = await getDb();
  if (!dbStatus) return;
  const profile = await getUserProfile(userId);
  if (profile) {
    const newXP = profile.xp + xpAmount;
    // Simple level formula for backward compatibility
    const newLevel = Math.floor(newXP / 1000) + 1;
    await dbStatus.update(userProfiles).set({ xp: newXP, level: newLevel }).where(eq(userProfiles.userId, userId));
  }
}

export async function getUserBadges(userId: number) {
  const dbStatus = await getDb();
  if (!dbStatus) return [];
  return await dbStatus.select().from(userBadges).where(eq(userBadges.userId, userId));
}

export async function addBadge(userId: number, badgeName: string, badgeIcon?: string, description?: string) {
  const dbStatus = await getDb();
  if (!dbStatus) return;
  await dbStatus.insert(userBadges).values({ userId, badgeName, badgeIcon: badgeIcon || "🏆", description });
}

// Study Session Functions
export async function createStudySession(data: InsertStudySession) {
  const db = await getDb();
  if (!db) return;
  await db.insert(studySessions).values(data);
}

export async function getUserStudySessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.createdAt));
}

// Flash Card Functions
export async function createFlashCardDeck(data: InsertFlashCardDeck) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(flashCardDecks).values(data);
  return result;
}

export async function getUserFlashCardDecks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(flashCardDecks).where(eq(flashCardDecks.userId, userId));
}

export async function addFlashCard(data: InsertFlashCard) {
  const db = await getDb();
  if (!db) return;
  await db.insert(flashCards).values(data);
}

export async function getDeckFlashCards(deckId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(flashCards).where(eq(flashCards.deckId, deckId));
}

export async function getUserStudySchedules(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(studySchedules).where(eq(studySchedules.userId, userId)).orderBy(desc(studySchedules.scheduledTime));
}

// Blocked Websites Functions
export async function addBlockedWebsite(data: InsertBlockedWebsite) {
  const db = await getDb();
  if (!db) return;
  await db.insert(blockedWebsites).values(data);
}

export async function getUserBlockedWebsites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blockedWebsites).where(eq(blockedWebsites.userId, userId));
}

export async function removeBlockedWebsite(websiteId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(blockedWebsites).where(eq(blockedWebsites.id, websiteId));
}

// AI Chat History Functions
export async function saveAIChatMessage(userId: number, message: string, response: string, topic?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiChatHistory).values({ userId, message, response, topic });
}

export async function getUserAIChatHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(aiChatHistory).where(eq(aiChatHistory.userId, userId)).orderBy(desc(aiChatHistory.createdAt));
}

// Community Posts Functions
export async function createCommunityPost(data: InsertCommunityPost) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(communityPosts).values(data);
  return result;
}

export async function getAllCommunityPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt));
}

export async function getCommunityPostWithAuthor(postId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const post = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
  if (post.length === 0) return undefined;

  const author = await db.select().from(users).where(eq(users.id, post[0].userId)).limit(1);
  return { ...post[0], author: author[0] || null };
}

export async function getUserCommunityPosts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(communityPosts).where(eq(communityPosts.userId, userId)).orderBy(desc(communityPosts.createdAt));
}

export async function updateCommunityPost(postId: number, data: Partial<InsertCommunityPost>) {
  const db = await getDb();
  if (!db) return;
  await db.update(communityPosts).set(data).where(eq(communityPosts.id, postId));
}

export async function deleteCommunityPost(postId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(communityPosts).where(eq(communityPosts.id, postId));
}

// Post Comments Functions
export async function addPostComment(data: InsertPostComment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(postComments).values(data);
  // Increment comment count
  await db.update(communityPosts).set({
    commentsCount: sql`${communityPosts.commentsCount} + 1`
  }).where(eq(communityPosts.id, data.postId));
}

export async function getPostComments(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(postComments).where(eq(postComments.postId, postId)).orderBy(desc(postComments.createdAt));
}

// Post Likes Functions
export async function likePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(postLikes).values({ postId, userId });
  await db.update(communityPosts).set({ likes: sql`${communityPosts.likes} + 1` }).where(eq(communityPosts.id, postId));
}

export async function unlikePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  await db.update(communityPosts).set({ likes: sql`${communityPosts.likes} - 1` }).where(eq(communityPosts.id, postId));
}

export async function hasUserLikedPost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))).limit(1);
  return result.length > 0;
}

// Notifications Functions
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    id: notifications.id,
    userId: notifications.userId,
    fromUserId: notifications.fromUserId,
    postId: notifications.postId,
    commentId: notifications.commentId,
    type: notifications.type,
    read: notifications.read,
    createdAt: notifications.createdAt,
    fromUserName: users.name,
    fromUserAvatar: userProfiles.profilePhoto
  })
    .from(notifications)
    .leftJoin(users, eq(notifications.fromUserId, users.id))
    .leftJoin(userProfiles, eq(notifications.fromUserId, userProfiles.userId))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  return result;
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(eq(notifications.id, notificationId));
}

// User Settings Functions
export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserSettings(userId: number, data: Partial<InsertUserSetting>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserSettings(userId);
  if (existing) {
    await db.update(userSettings).set(data).where(eq(userSettings.userId, userId));
  } else {
    await db.insert(userSettings).values({ userId, ...data });
  }
}

export async function markNotificationAsRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) return;
  if (notificationId === -1) {
    await db.update(notifications).set({ read: 1 }).where(eq(notifications.userId, userId));
  } else {
    await db.update(notifications).set({ read: 1 }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }
}


// User Functions
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}

// Community Post Functions
export async function getCommunityPost(postId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
  return result[0] || null;
}

export async function updateUserName(userId: number, name: string) {
  const db = await getDb();
  if (!db) return;
  const user = await getUserById(userId);
  if (user) {
    await db.update(users).set({ name }).where(eq(users.id, userId));
  }
}

export async function updateProfilePhoto(userId: number, photoBase64: string) {
  const db = await getDb();
  if (!db) return;
  const profile = await getUserProfile(userId);
  if (profile) {
    await db.update(userProfiles).set({ profilePhoto: photoBase64, updatedAt: new Date().toISOString() }).where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, profilePhoto: photoBase64 });
  }
}

export async function updateUserBio(userId: number, bio: string) {
  const db = await getDb();
  if (!db) return;
  const profile = await getUserProfile(userId);
  if (profile) {
    await db.update(userProfiles).set({ bio, updatedAt: new Date().toISOString() }).where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, bio });
  }
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, 0)));
  return result[0]?.count || 0;
}

export async function createStudyMaterial(material: InsertStudyMaterial) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(studyMaterials).values(material).returning({ id: studyMaterials.id });
  return result[0]?.id;
}

export async function getStudyMaterials(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(studyMaterials).where(eq(studyMaterials.userId, userId)).orderBy(desc(studyMaterials.createdAt));
}

export async function getStudyMaterialById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(studyMaterials).where(eq(studyMaterials.id, id)).limit(1);
  return result[0] || null;
}

export async function createStudySchedule(sessions: InsertStudySchedule[]) {
  const db = await getDb();
  if (!db || sessions.length === 0) return;
  await db.insert(studySchedules).values(sessions);
}

export async function deleteStudySchedule(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(studySchedules).where(eq(studySchedules.userId, userId));
}

export async function getStudySchedule(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(studySchedules)
    .where(eq(studySchedules.userId, userId))
    .orderBy(studySchedules.scheduledTime);
}

export async function updateScheduleStatus(id: number, userId: number, completed: number, meta?: { subject?: string, duration?: number, scheduledTime?: Date }) {
  const db = await getDb();
  if (!db) return;
  await db.update(studySchedules)
    .set({ 
      completed, 
      ...meta, 
      scheduledTime: meta?.scheduledTime ? new Date(meta.scheduledTime).toISOString() : undefined 
    })
    .where(and(eq(studySchedules.id, id), eq(studySchedules.userId, userId)));
}

export async function getStudySessionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(studySchedules)
    .where(and(eq(studySchedules.id, id), eq(studySchedules.userId, userId)))
    .limit(1);
  return result[0] || null;
}
