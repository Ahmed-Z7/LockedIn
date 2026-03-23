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
  level: int("level").default(1).notNull(),
  streak: int("streak").default(0).notNull(),
  streakLongest: int("streakLongest").default(0).notNull(),
  totalStudyTime: int("totalStudyTime").default(0).notNull(), // in minutes
  lastStudyDate: timestamp("lastStudyDate"),
  bio: text("bio"),
  profilePhoto: text("profilePhoto"),
  rank: varchar("rank", { length: 100 }).default("Focused Beginner"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// Static Challenge Definitions
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["study_time", "streak", "focus", "group", "ai_usage", "consistency"]).notNull(),
  targetValue: int("targetValue").notNull(),
  rewardXp: int("rewardXp").notNull(),
  rewardBadgeName: varchar("rewardBadgeName", { length: 100 }),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("easy"),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// User Progress on Challenges
export const userChallenges = mysqlTable("userChallenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  challengeId: int("challengeId").notNull().references(() => challenges.id),
  currentProgress: int("currentProgress").default(0).notNull(),
  completed: int("completed").default(0).notNull(), // 0 or 1
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

// Earned Badges
export const userBadges = mysqlTable("userBadges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  badgeName: varchar("badgeName", { length: 100 }).notNull(),
  badgeIcon: varchar("badgeIcon", { length: 100 }).notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common"),
  description: text("description"),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

// User Activity Log (for Timeline)
export const userActivities = mysqlTable("userActivities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // study_session, challenge_complete, badge_earned, level_up
  description: text("description").notNull(),
  xpGain: int("xpGain").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = typeof userActivities.$inferInsert;

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
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  sessionType: mysqlEnum("sessionType", ["study", "review"]).default("study"),
  completed: int("completed").default(0),
  materialId: int("materialId").references(() => studyMaterials.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudySchedule = typeof studySchedules.$inferSelect;
export type InsertStudySchedule = typeof studySchedules.$inferInsert;

// Study Material
export const studyMaterials = mysqlTable("studyMaterials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  type: varchar("type", { length: 50 }).notNull(), // pdf, docx, text
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type InsertStudyMaterial = typeof studyMaterials.$inferInsert;

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
  type: mysqlEnum("type", ["like", "comment", "follow", "badge", "study_session"]).notNull(),
  read: int("read").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// User Settings
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  achievementNotifications: int("achievementNotifications").default(1),
  socialNotifications: int("socialNotifications").default(1),
  messageNotifications: int("messageNotifications").default(1),
  challengeReminders: int("challengeReminders").default(1),
  weeklyDigest: int("weeklyDigest").default(1),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSetting = typeof userSettings.$inferSelect;
export type InsertUserSetting = typeof userSettings.$inferInsert;
// ── NEW: DIRECT MESSAGING SYSTEM ──
export const directMessages = mysqlTable("directMessages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull().references(() => users.id),
  receiverId: int("receiverId").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: int("read").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

// ── NEW: STUDY GROUPS SYSTEM ──
export const studyGroups = mysqlTable("studyGroups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  creatorId: int("creatorId").notNull().references(() => users.id),
  avatar: text("avatar"),
  isPrivate: int("isPrivate").default(0), // 0 for public, 1 for private
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyGroup = typeof studyGroups.$inferSelect;
export type InsertStudyGroup = typeof studyGroups.$inferInsert;

export const studyGroupMembers = mysqlTable("studyGroupMembers", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull().references(() => studyGroups.id),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["admin", "member"]).default("member").notNull(),
  status: mysqlEnum("status", ["pending", "approved"]).default("approved").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type StudyGroupMember = typeof studyGroupMembers.$inferSelect;
export type InsertStudyGroupMember = typeof studyGroupMembers.$inferInsert;

export const studyGroupInvitations = mysqlTable("studyGroupInvitations", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull().references(() => studyGroups.id),
  senderId: int("senderId").notNull().references(() => users.id),
  receiverId: int("receiverId").notNull().references(() => users.id),
  status: mysqlEnum("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGroupInvitation = typeof studyGroupInvitations.$inferSelect;
export type InsertStudyGroupInvitation = typeof studyGroupInvitations.$inferInsert;

// ── NEW: GROUP CONTENT & COLLABORATION ──
export const studyGroupPosts = mysqlTable("studyGroupPosts", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull().references(() => studyGroups.id),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  likes: int("likes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyGroupPost = typeof studyGroupPosts.$inferSelect;
export type InsertStudyGroupPost = typeof studyGroupPosts.$inferInsert;

export const studyGroupTasks = mysqlTable("studyGroupTasks", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull().references(() => studyGroups.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["open", "completed"]).default("open").notNull(),
  dueDate: timestamp("dueDate"),
  assignedTo: int("assignedTo").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGroupTask = typeof studyGroupTasks.$inferSelect;
export type InsertStudyGroupTask = typeof studyGroupTasks.$inferInsert;

export const studyGroupMessages = mysqlTable("studyGroupMessages", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull().references(() => studyGroups.id),
  userId: int("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGroupMessage = typeof studyGroupMessages.$inferSelect;
export type InsertStudyGroupMessage = typeof studyGroupMessages.$inferInsert;

export const studyGroupMaterials = mysqlTable("studyGroupMaterials", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull().references(() => studyGroups.id),
  materialId: int("materialId").notNull().references(() => studyMaterials.id),
  uploadedBy: int("uploadedBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGroupMaterial = typeof studyGroupMaterials.$inferSelect;
export type InsertStudyGroupMaterial = typeof studyGroupMaterials.$inferInsert;
