import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  /** Username generated from email - NOT editable by user */
  username: varchar("username", { length: 100 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// User Profile & Gamification
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  xp: int("xp").default(0).notNull(),
  level: int("level").default(0).notNull(),
  streak: int("streak").default(0).notNull(),
  totalStudyTime: int("totalStudyTime").default(0).notNull(), // in minutes
  badgesCount: int("badgesCount").default(0).notNull(),
  bio: text("bio"),
  profilePhoto: varchar("profilePhoto", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// Badges & Achievements
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  badgeName: varchar("badgeName", { length: 100 }).notNull(),
  badgeIcon: varchar("badgeIcon", { length: 500 }),
  description: text("description"),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

// Study Sessions
export const studySessions = mysqlTable("studySessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  subject: varchar("subject", { length: 100 }).notNull(),
  duration: int("duration").notNull(), // in minutes
  focusScore: int("focusScore").default(0), // 0-100
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = typeof studySessions.$inferInsert;

// Flash Cards
export const flashCardDecks = mysqlTable("flashCardDecks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  cardCount: int("cardCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FlashCardDeck = typeof flashCardDecks.$inferSelect;
export type InsertFlashCardDeck = typeof flashCardDecks.$inferInsert;

export const flashCards = mysqlTable("flashCards", {
  id: int("id").autoincrement().primaryKey(),
  deckId: int("deckId").notNull().references(() => flashCardDecks.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  reviewCount: int("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlashCard = typeof flashCards.$inferSelect;
export type InsertFlashCard = typeof flashCards.$inferInsert;

// Study Schedule
export const studySchedules = mysqlTable("studySchedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  subject: varchar("subject", { length: 100 }).notNull(),
  scheduledTime: timestamp("scheduledTime").notNull(),
  duration: int("duration").notNull(), // in minutes
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  completed: int("completed").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudySchedule = typeof studySchedules.$inferSelect;
export type InsertStudySchedule = typeof studySchedules.$inferInsert;

// Blocked Websites
export const blockedWebsites = mysqlTable("blockedWebsites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  domain: varchar("domain", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlockedWebsite = typeof blockedWebsites.$inferSelect;
export type InsertBlockedWebsite = typeof blockedWebsites.$inferInsert;

// AI Chat History
export const aiChatHistory = mysqlTable("aiChatHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  topic: varchar("topic", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAIChatHistory = typeof aiChatHistory.$inferInsert;

// Community Posts
export const communityPosts = mysqlTable("communityPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).default("general"),
  likes: int("likes").default(0),
  commentsCount: int("commentsCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// Post Comments
export const postComments = mysqlTable("postComments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull().references(() => communityPosts.id),
  userId: int("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

// Post Likes
export const postLikes = mysqlTable("postLikes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull().references(() => communityPosts.id),
  userId: int("userId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

// Notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  fromUserId: int("fromUserId").notNull().references(() => users.id),
  postId: int("postId").references(() => communityPosts.id),
  commentId: int("commentId").references(() => postComments.id),
  type: mysqlEnum("type", ["like", "comment", "follow"]).notNull(),
  read: int("read").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
