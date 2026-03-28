import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const categoryEnum = pgEnum("category", ["study_time", "streak", "focus", "group", "ai_usage", "consistency"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const rarityEnum = pgEnum("rarity", ["common", "rare", "epic", "legendary"]);
export const sessionTypeEnum = pgEnum("sessionType", ["study", "review"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const notificationTypeEnum = pgEnum("notification_type", ["like", "comment", "follow", "badge", "study_session"]);
export const groupRoleEnum = pgEnum("group_role", ["admin", "member"]);
export const groupStatusEnum = pgEnum("group_status", ["pending", "approved"]);
export const invitationStatusEnum = pgEnum("invitation_status", ["pending", "accepted", "declined"]);
export const taskStatusEnum = pgEnum("task_status", ["open", "completed"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  /** Username generated from email - NOT editable by user */
  username: varchar("username", { length: 100 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// User Profile & Gamification
export const userProfiles = pgTable("userProfiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  streak: integer("streak").default(0).notNull(),
  streakLongest: integer("streakLongest").default(0).notNull(),
  totalStudyTime: integer("totalStudyTime").default(0).notNull(), // in minutes
  lastStudyDate: timestamp("lastStudyDate"),
  bio: text("bio"),
  profilePhoto: text("profilePhoto"),
  rank: varchar("rank", { length: 100 }).default("Focused Beginner"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// Static Challenge Definitions
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  targetValue: integer("targetValue").notNull(),
  rewardXp: integer("rewardXp").notNull(),
  rewardBadgeName: varchar("rewardBadgeName", { length: 100 }),
  difficulty: difficultyEnum("difficulty").default("easy"),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// User Progress on Challenges
export const userChallenges = pgTable("userChallenges", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  challengeId: integer("challengeId").notNull().references(() => challenges.id),
  currentProgress: integer("currentProgress").default(0).notNull(),
  completed: integer("completed").default(0).notNull(), // 0 or 1
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

// Earned Badges
export const userBadges = pgTable("userBadges", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  badgeName: varchar("badgeName", { length: 100 }).notNull(),
  badgeIcon: varchar("badgeIcon", { length: 100 }).notNull(),
  rarity: rarityEnum("rarity").default("common"),
  description: text("description"),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

// User Activity Log (for Timeline)
export const userActivities = pgTable("userActivities", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // study_session, challenge_complete, badge_earned, level_up
  description: text("description").notNull(),
  xpGain: integer("xpGain").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = typeof userActivities.$inferInsert;

// Study Sessions
export const studySessions = pgTable("studySessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  subject: varchar("subject", { length: 100 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  focusScore: integer("focusScore").default(0), // 0-100
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = typeof studySessions.$inferInsert;

// Flash Cards
export const flashCardDecks = pgTable("flashCardDecks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  cardCount: integer("cardCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type FlashCardDeck = typeof flashCardDecks.$inferSelect;
export type InsertFlashCardDeck = typeof flashCardDecks.$inferInsert;

export const flashCards = pgTable("flashCards", {
  id: serial("id").primaryKey(),
  deckId: integer("deckId").notNull().references(() => flashCardDecks.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  difficulty: difficultyEnum("difficulty").default("medium"),
  reviewCount: integer("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlashCard = typeof flashCards.$inferSelect;
export type InsertFlashCard = typeof flashCards.$inferInsert;

// Study Schedule
export const studySchedules = pgTable("studySchedules", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  subject: varchar("subject", { length: 100 }).notNull(),
  scheduledTime: timestamp("scheduledTime").notNull(),
  duration: integer("duration").notNull(), // in minutes
  priority: priorityEnum("priority").default("medium"),
  difficulty: difficultyEnum("difficulty").default("medium"),
  sessionType: sessionTypeEnum("sessionType").default("study"),
  completed: integer("completed").default(0),
  materialId: integer("materialId").references(() => studyMaterials.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudySchedule = typeof studySchedules.$inferSelect;
export type InsertStudySchedule = typeof studySchedules.$inferInsert;

// Study Material
export const studyMaterials = pgTable("studyMaterials", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  type: varchar("type", { length: 50 }).notNull(), // pdf, docx, text
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type InsertStudyMaterial = typeof studyMaterials.$inferInsert;

// Blocked Websites
export const blockedWebsites = pgTable("blockedWebsites", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  domain: varchar("domain", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlockedWebsite = typeof blockedWebsites.$inferSelect;
export type InsertBlockedWebsite = typeof blockedWebsites.$inferInsert;

// AI Chat History
export const aiChatHistory = pgTable("aiChatHistory", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  topic: varchar("topic", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAIChatHistory = typeof aiChatHistory.$inferInsert;

// Community Posts
export const communityPosts = pgTable("communityPosts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).default("general"),
  likes: integer("likes").default(0),
  commentsCount: integer("commentsCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

// Post Comments
export const postComments = pgTable("postComments", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull().references(() => communityPosts.id),
  userId: integer("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

// Post Likes
export const postLikes = pgTable("postLikes", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull().references(() => communityPosts.id),
  userId: integer("userId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  fromUserId: integer("fromUserId").notNull().references(() => users.id),
  postId: integer("postId").references(() => communityPosts.id),
  commentId: integer("commentId").references(() => postComments.id),
  type: notificationTypeEnum("type").notNull(),
  read: integer("read").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// User Settings
export const userSettings = pgTable("userSettings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique().references(() => users.id),
  achievementNotifications: integer("achievementNotifications").default(1),
  socialNotifications: integer("socialNotifications").default(1),
  messageNotifications: integer("messageNotifications").default(1),
  challengeReminders: integer("challengeReminders").default(1),
  weeklyDigest: integer("weeklyDigest").default(1),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type UserSetting = typeof userSettings.$inferSelect;
export type InsertUserSetting = typeof userSettings.$inferInsert;
// ── NEW: DIRECT MESSAGING SYSTEM ──
export const directMessages = pgTable("directMessages", {
  id: serial("id").primaryKey(),
  senderId: integer("senderId").notNull().references(() => users.id),
  receiverId: integer("receiverId").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: integer("read").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

// ── NEW: STUDY GROUPS SYSTEM ──
export const studyGroups = pgTable("studyGroups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  creatorId: integer("creatorId").notNull().references(() => users.id),
  avatar: text("avatar"),
  isPrivate: integer("isPrivate").default(0), // 0 for public, 1 for private
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type StudyGroup = typeof studyGroups.$inferSelect;
export type InsertStudyGroup = typeof studyGroups.$inferInsert;

export const studyGroupMembers = pgTable("studyGroupMembers", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull().references(() => studyGroups.id),
  userId: integer("userId").notNull().references(() => users.id),
  role: groupRoleEnum("role").default("member").notNull(),
  status: groupStatusEnum("status").default("approved").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type StudyGroupMember = typeof studyGroupMembers.$inferSelect;
export type InsertStudyGroupMember = typeof studyGroupMembers.$inferInsert;

export const studyGroupInvitations = pgTable("studyGroupInvitations", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull().references(() => studyGroups.id),
  senderId: integer("senderId").notNull().references(() => users.id),
  receiverId: integer("receiverId").notNull().references(() => users.id),
  status: invitationStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGroupInvitation = typeof studyGroupInvitations.$inferSelect;
export type InsertStudyGroupInvitation = typeof studyGroupInvitations.$inferInsert;

// ── NEW: GROUP CONTENT & COLLABORATION ──
export const studyGroupPosts = pgTable("studyGroupPosts", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull().references(() => studyGroups.id),
  userId: integer("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type StudyGroupPost = typeof studyGroupPosts.$inferSelect;
export type InsertStudyGroupPost = typeof studyGroupPosts.$inferInsert;

export const studyGroupTasks = pgTable("studyGroupTasks", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull().references(() => studyGroups.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("open").notNull(),
  dueDate: timestamp("dueDate"),
  assignedTo: integer("assignedTo").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGroupTask = typeof studyGroupTasks.$inferSelect;
export type InsertStudyGroupTask = typeof studyGroupTasks.$inferInsert;

export const studyGroupMessages = pgTable("studyGroupMessages", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull().references(() => studyGroups.id),
  userId: integer("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGroupMessage = typeof studyGroupMessages.$inferSelect;
export type InsertStudyGroupMessage = typeof studyGroupMessages.$inferInsert;

export const studyGroupMaterials = pgTable("studyGroupMaterials", {
  id: serial("id").primaryKey(),
  groupId: integer("groupId").notNull().references(() => studyGroups.id),
  materialId: integer("materialId").notNull().references(() => studyMaterials.id),
  uploadedBy: integer("uploadedBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyGroupMaterial = typeof studyGroupMaterials.$inferSelect;
export type InsertStudyGroupMaterial = typeof studyGroupMaterials.$inferInsert;
