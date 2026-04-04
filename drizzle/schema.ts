import { pgTable, foreignKey, serial, integer, varchar, timestamp, text, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// --- ENUMS ---
export const category = pgEnum("category", ['study_time', 'streak', 'focus', 'group', 'ai_usage', 'consistency'])
export const difficulty = pgEnum("difficulty", ['easy', 'medium', 'hard'])
export const groupRole = pgEnum("group_role", ['admin', 'member'])
export const groupStatus = pgEnum("group_status", ['pending', 'approved'])
export const invitationStatus = pgEnum("invitation_status", ['pending', 'accepted', 'declined'])
export const notificationType = pgEnum("notification_type", ['like', 'comment', 'follow', 'badge', 'study_session', 'friend_request', 'friend_accept', 'friend_reject', 'message', 'friend_post', 'group_post_like', 'group_post_comment', 'group_join_request', 'group_join_accept', 'group_join_reject'])
export const priority = pgEnum("priority", ['low', 'medium', 'high'])
export const rarity = pgEnum("rarity", ['common', 'rare', 'epic', 'legendary'])
export const role = pgEnum("role", ['user', 'admin'])
export const sessionType = pgEnum("sessionType", ['study', 'review'])
export const taskStatus = pgEnum("task_status", ['open', 'completed'])

// --- CORE TABLES ---
export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	username: varchar({ length: 100 }),
	loginMethod: varchar({ length: 64 }),
	role: role().default('user').notNull(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_openId_unique").on(table.openId),
	unique("users_username_unique").on(table.username),
]);

export const challenges = pgTable("challenges", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	category: category().notNull(),
	targetValue: integer().notNull(),
	rewardXp: integer().notNull(),
	rewardBadgeName: varchar({ length: 100 }),
	difficulty: difficulty().default('easy'),
});

export const studyGroups = pgTable("studyGroups", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	creatorId: integer().notNull(),
	avatar: text(),
	isPrivate: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "studyGroups_creatorId_users_id_fk"
		}),
]);

export const communityPosts = pgTable("communityPosts", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	category: varchar({ length: 100 }).default('general'),
	likes: integer().default(0),
	commentsCount: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "communityPosts_userId_users_id_fk"
		}),
]);

export const studyGroupPosts = pgTable("studyGroupPosts", {
	id: serial().primaryKey().notNull(),
	groupId: integer().notNull(),
	userId: integer().notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	likes: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [studyGroups.id],
			name: "studyGroupPosts_groupId_studyGroups_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "studyGroupPosts_userId_users_id_fk"
		}),
]);

export const postComments = pgTable("postComments", {
	id: serial().primaryKey().notNull(),
	postId: integer().notNull(),
	userId: integer().notNull(),
	content: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [communityPosts.id],
			name: "postComments_postId_communityPosts_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "postComments_userId_users_id_fk"
		}),
]);

export const studyMaterials = pgTable("studyMaterials", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text(),
	fileUrl: varchar({ length: 500 }),
	type: varchar({ length: 50 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "studyMaterials_userId_users_id_fk"
		}),
]);

export const flashCardDecks = pgTable("flashCardDecks", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }),
	cardCount: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "flashCardDecks_userId_users_id_fk"
		}),
]);


// --- DEPENDENT TABLES ---
export const studySessions = pgTable("studySessions", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	subject: varchar({ length: 100 }).notNull(),
	duration: integer().notNull(),
	focusScore: integer().default(0),
	startTime: timestamp({ mode: 'string' }).notNull(),
	endTime: timestamp({ mode: 'string' }),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "studySessions_userId_users_id_fk"
		}),
]);

export const aiConversations = pgTable("aiConversations", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	title: varchar({ length: 200 }).notNull().default('New Concept'),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "aiConversations_userId_users_id_fk"
		}),
]);

export const aiChatHistory = pgTable("aiChatHistory", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	conversationId: integer(),
	message: text().notNull(),
	response: text(),
	topic: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "aiChatHistory_userId_users_id_fk"
		}),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [aiConversations.id],
			name: "aiChatHistory_conversationId_aiConversations_id_fk"
		}),
]);

export const userAIKnowledge = pgTable("userAIKnowledge", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	content: text().notNull(),
	category: varchar({ length: 50 }).default('preference'),
	confidence: integer().default(100),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "userAIKnowledge_userId_users_id_fk"
		}),
]);

export const directMessages = pgTable("directMessages", {
	id: serial().primaryKey().notNull(),
	senderId: integer().notNull(),
	receiverId: integer().notNull(),
	content: text().notNull(),
	read: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "directMessages_senderId_users_id_fk"
		}),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.id],
			name: "directMessages_receiverId_users_id_fk"
		}),
]);

export const flashCards = pgTable("flashCards", {
	id: serial().primaryKey().notNull(),
	deckId: integer().notNull(),
	question: text().notNull(),
	answer: text().notNull(),
	difficulty: difficulty().default('medium'),
	reviewCount: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.deckId],
			foreignColumns: [flashCardDecks.id],
			name: "flashCards_deckId_flashCardDecks_id_fk"
		}),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	fromUserId: integer().notNull(),
	postId: integer(),
	groupPostId: integer(),
	groupId: integer(),
	commentId: integer(),
	type: notificationType().notNull(),
	read: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_userId_users_id_fk"
		}),
	foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.id],
			name: "notifications_fromUserId_users_id_fk"
		}),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [communityPosts.id],
			name: "notifications_postId_communityPosts_id_fk"
		}),
	foreignKey({
			columns: [table.groupPostId],
			foreignColumns: [studyGroupPosts.id],
			name: "notifications_groupPostId_studyGroupPosts_id_fk"
		}),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [postComments.id],
			name: "notifications_commentId_postComments_id_fk"
		}),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [studyGroups.id],
			name: "notifications_groupId_studyGroups_id_fk"
		}),
]);

export const blockedWebsites = pgTable("blockedWebsites", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	reason: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "blockedWebsites_userId_users_id_fk"
		}),
]);

export const studyGroupTasks = pgTable("studyGroupTasks", {
	id: serial().primaryKey().notNull(),
	groupId: integer().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	status: taskStatus().default('open').notNull(),
	dueDate: timestamp({ mode: 'string' }),
	assignedTo: integer(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [studyGroups.id],
			name: "studyGroupTasks_groupId_studyGroups_id_fk"
		}),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "studyGroupTasks_assignedTo_users_id_fk"
		}),
]);

export const postLikes = pgTable("postLikes", {
	id: serial().primaryKey().notNull(),
	postId: integer().notNull(),
	userId: integer().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [communityPosts.id],
			name: "postLikes_postId_communityPosts_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "postLikes_userId_users_id_fk"
		}),
]);

export const studyGroupInvitations = pgTable("studyGroupInvitations", {
	id: serial().primaryKey().notNull(),
	groupId: integer().notNull(),
	senderId: integer().notNull(),
	receiverId: integer().notNull(),
	status: invitationStatus().default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [studyGroups.id],
			name: "studyGroupInvitations_groupId_studyGroups_id_fk"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "studyGroupInvitations_senderId_users_id_fk"
		}),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.id],
			name: "studyGroupInvitations_receiverId_users_id_fk"
		}),
]);

export const studyGroupPostLikes = pgTable("studyGroupPostLikes", {
	id: serial().primaryKey().notNull(),
	postId: integer().notNull(),
	userId: integer().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [studyGroupPosts.id],
			name: "studyGroupPostLikes_postId_studyGroupPosts_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "studyGroupPostLikes_userId_users_id_fk"
		}),
]);

export const studyGroupPostComments = pgTable("studyGroupPostComments", {
	id: serial().primaryKey().notNull(),
	postId: integer().notNull(),
	userId: integer().notNull(),
	content: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [studyGroupPosts.id],
			name: "studyGroupPostComments_postId_studyGroupPosts_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "studyGroupPostComments_userId_users_id_fk"
		}),
]);

export const studyGroupMaterials = pgTable("studyGroupMaterials", {
	id: serial().primaryKey().notNull(),
	groupId: integer().notNull(),
	materialId: integer().notNull(),
	uploadedBy: integer().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [studyGroups.id],
			name: "studyGroupMaterials_groupId_studyGroups_id_fk"
		}),
	foreignKey({
			columns: [table.materialId],
			foreignColumns: [studyMaterials.id],
			name: "studyGroupMaterials_materialId_studyMaterials_id_fk"
		}),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "studyGroupMaterials_uploadedBy_users_id_fk"
		}),
]);

export const studyGroupMembers = pgTable("studyGroupMembers", {
	id: serial().primaryKey().notNull(),
	groupId: integer().notNull(),
	userId: integer().notNull(),
	role: groupRole().default('member').notNull(),
	status: groupStatus().default('approved').notNull(),
	joinedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [studyGroups.id],
			name: "studyGroupMembers_groupId_studyGroups_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "studyGroupMembers_userId_users_id_fk"
		}),
]);

export const studyGroupMessages = pgTable("studyGroupMessages", {
	id: serial().primaryKey().notNull(),
	groupId: integer().notNull(),
	userId: integer().notNull(),
	content: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [studyGroups.id],
			name: "studyGroupMessages_groupId_studyGroups_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "studyGroupMessages_userId_users_id_fk"
		}),
]);

export const studySchedules = pgTable("studySchedules", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	subject: varchar({ length: 100 }).notNull(),
	scheduledTime: timestamp({ mode: 'string' }).notNull(),
	duration: integer().notNull(),
	priority: priority().default('medium'),
	difficulty: difficulty().default('medium'),
	sessionType: sessionType().default('study'),
	completed: integer().default(0),
	materialId: integer(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "studySchedules_userId_users_id_fk"
		}),
	foreignKey({
			columns: [table.materialId],
			foreignColumns: [studyMaterials.id],
			name: "studySchedules_materialId_studyMaterials_id_fk"
		}),
]);

export const userActivities = pgTable("userActivities", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text().notNull(),
	xpGain: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "userActivities_userId_users_id_fk"
		}),
]);

export const userBadges = pgTable("userBadges", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	badgeName: varchar({ length: 100 }).notNull(),
	badgeIcon: varchar({ length: 100 }).notNull(),
	rarity: rarity().default('common'),
	description: text(),
	earnedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "userBadges_userId_users_id_fk"
		}),
]);

export const userChallenges = pgTable("userChallenges", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	challengeId: integer().notNull(),
	currentProgress: integer().default(0).notNull(),
	completed: integer().default(0).notNull(),
	completedAt: timestamp({ mode: 'string' }),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "userChallenges_userId_users_id_fk"
		}),
	foreignKey({
			columns: [table.challengeId],
			foreignColumns: [challenges.id],
			name: "userChallenges_challengeId_challenges_id_fk"
		}),
]);

export const userProfiles = pgTable("userProfiles", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	xp: integer().default(0).notNull(),
	level: integer().default(1).notNull(),
	streak: integer().default(0).notNull(),
	streakLongest: integer().default(0).notNull(),
	totalStudyTime: integer().default(0).notNull(),
	lastStudyDate: timestamp({ mode: 'string' }),
	bio: text(),
	profilePhoto: text(),
	status: text().default('Ana LOCKEDIN'),
	avatarFrame: varchar({ length: 50 }).default('none'),
	rank: varchar({ length: 100 }).default('Focused Beginner'),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "userProfiles_userId_users_id_fk"
		}),
]);

export const userSettings = pgTable("userSettings", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	achievementNotifications: integer().default(1),
	socialNotifications: integer().default(1),
	messageNotifications: integer().default(1),
	challengeReminders: integer().default(1),
	weeklyDigest: integer().default(1),
	aiTone: varchar({ length: 50 }).default('friendly'),
	aiLanguage: varchar({ length: 50 }).default('bilingual'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "userSettings_userId_users_id_fk"
		}),
	unique("userSettings_userId_unique").on(table.userId),
]);

export const verificationCodes = pgTable("verificationCodes", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 320 }).notNull(),
	code: varchar({ length: 10 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	name: text(),
	passwordHash: text(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const friends = pgTable("friends", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	friendId: integer().notNull(),
	status: varchar({ length: 20 }).default('pending'),
	isFavorite: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "friends_userId_users_id_fk"
	}),
	foreignKey({
		columns: [table.friendId],
		foreignColumns: [users.id],
		name: "friends_friendId_users_id_fk"
	}),
]);

// --- TYPES & HELPERS ---
export type InsertUser = typeof users.$inferInsert;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type InsertUserBadge = typeof userBadges.$inferInsert;
export type InsertStudySession = typeof studySessions.$inferInsert;
export type InsertFlashCardDeck = typeof flashCardDecks.$inferInsert;
export type InsertFlashCard = typeof flashCards.$inferInsert;
export type InsertStudySchedule = typeof studySchedules.$inferInsert;
export type InsertBlockedWebsite = typeof blockedWebsites.$inferInsert;
export type InsertAIChatHistory = typeof aiChatHistory.$inferInsert;
export type InsertAIConversation = typeof aiConversations.$inferInsert;
export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type InsertPostComment = typeof postComments.$inferInsert;
export type InsertPostLike = typeof postLikes.$inferInsert;
export type InsertNotification = typeof notifications.$inferInsert;
export type InsertUserSetting = typeof userSettings.$inferInsert;
export type InsertStudyMaterial = typeof studyMaterials.$inferInsert;
export type InsertChallenge = typeof challenges.$inferInsert;
export type InsertUserAIKnowledge = typeof userAIKnowledge.$inferInsert;
export type UserAIKnowledge = typeof userAIKnowledge.$inferSelect;
export type InsertFriend = typeof friends.$inferInsert;
export type Friend = typeof friends.$inferSelect;
export type InsertVerificationCode = typeof verificationCodes.$inferInsert;
export type User = typeof users.$inferSelect;
