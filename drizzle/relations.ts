import { relations } from "drizzle-orm/relations";
import { users, studySessions, aiChatHistory, directMessages, flashCardDecks, flashCards, notifications, communityPosts, postComments, blockedWebsites, studyGroups, studyGroupPosts, studyGroupTasks, postLikes, studyGroupInvitations, studyGroupMaterials, studyMaterials, studyGroupMembers, studyGroupMessages, studySchedules, userActivities, userBadges, userChallenges, challenges, userProfiles, userSettings } from "./schema";

export const studySessionsRelations = relations(studySessions, ({one}) => ({
	user: one(users, {
		fields: [studySessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	studySessions: many(studySessions),
	aiChatHistories: many(aiChatHistory),
	directMessages_senderId: many(directMessages, {
		relationName: "directMessages_senderId_users_id"
	}),
	directMessages_receiverId: many(directMessages, {
		relationName: "directMessages_receiverId_users_id"
	}),
	flashCardDecks: many(flashCardDecks),
	notifications_userId: many(notifications, {
		relationName: "notifications_userId_users_id"
	}),
	notifications_fromUserId: many(notifications, {
		relationName: "notifications_fromUserId_users_id"
	}),
	blockedWebsites: many(blockedWebsites),
	communityPosts: many(communityPosts),
	studyGroupPosts: many(studyGroupPosts),
	studyGroupTasks: many(studyGroupTasks),
	postComments: many(postComments),
	postLikes: many(postLikes),
	studyGroupInvitations_senderId: many(studyGroupInvitations, {
		relationName: "studyGroupInvitations_senderId_users_id"
	}),
	studyGroupInvitations_receiverId: many(studyGroupInvitations, {
		relationName: "studyGroupInvitations_receiverId_users_id"
	}),
	studyGroupMaterials: many(studyGroupMaterials),
	studyGroupMembers: many(studyGroupMembers),
	studyGroupMessages: many(studyGroupMessages),
	studySchedules: many(studySchedules),
	studyGroups: many(studyGroups),
	studyMaterials: many(studyMaterials),
	userActivities: many(userActivities),
	userBadges: many(userBadges),
	userChallenges: many(userChallenges),
	userProfiles: many(userProfiles),
	userSettings: many(userSettings),
}));

export const aiChatHistoryRelations = relations(aiChatHistory, ({one}) => ({
	user: one(users, {
		fields: [aiChatHistory.userId],
		references: [users.id]
	}),
}));

export const directMessagesRelations = relations(directMessages, ({one}) => ({
	user_senderId: one(users, {
		fields: [directMessages.senderId],
		references: [users.id],
		relationName: "directMessages_senderId_users_id"
	}),
	user_receiverId: one(users, {
		fields: [directMessages.receiverId],
		references: [users.id],
		relationName: "directMessages_receiverId_users_id"
	}),
}));

export const flashCardDecksRelations = relations(flashCardDecks, ({one, many}) => ({
	user: one(users, {
		fields: [flashCardDecks.userId],
		references: [users.id]
	}),
	flashCards: many(flashCards),
}));

export const flashCardsRelations = relations(flashCards, ({one}) => ({
	flashCardDeck: one(flashCardDecks, {
		fields: [flashCards.deckId],
		references: [flashCardDecks.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user_userId: one(users, {
		fields: [notifications.userId],
		references: [users.id],
		relationName: "notifications_userId_users_id"
	}),
	user_fromUserId: one(users, {
		fields: [notifications.fromUserId],
		references: [users.id],
		relationName: "notifications_fromUserId_users_id"
	}),
	communityPost: one(communityPosts, {
		fields: [notifications.postId],
		references: [communityPosts.id]
	}),
	postComment: one(postComments, {
		fields: [notifications.commentId],
		references: [postComments.id]
	}),
}));

export const communityPostsRelations = relations(communityPosts, ({one, many}) => ({
	notifications: many(notifications),
	user: one(users, {
		fields: [communityPosts.userId],
		references: [users.id]
	}),
	postComments: many(postComments),
	postLikes: many(postLikes),
}));

export const postCommentsRelations = relations(postComments, ({one, many}) => ({
	notifications: many(notifications),
	communityPost: one(communityPosts, {
		fields: [postComments.postId],
		references: [communityPosts.id]
	}),
	user: one(users, {
		fields: [postComments.userId],
		references: [users.id]
	}),
}));

export const blockedWebsitesRelations = relations(blockedWebsites, ({one}) => ({
	user: one(users, {
		fields: [blockedWebsites.userId],
		references: [users.id]
	}),
}));

export const studyGroupPostsRelations = relations(studyGroupPosts, ({one}) => ({
	studyGroup: one(studyGroups, {
		fields: [studyGroupPosts.groupId],
		references: [studyGroups.id]
	}),
	user: one(users, {
		fields: [studyGroupPosts.userId],
		references: [users.id]
	}),
}));

export const studyGroupsRelations = relations(studyGroups, ({one, many}) => ({
	studyGroupPosts: many(studyGroupPosts),
	studyGroupTasks: many(studyGroupTasks),
	studyGroupInvitations: many(studyGroupInvitations),
	studyGroupMaterials: many(studyGroupMaterials),
	studyGroupMembers: many(studyGroupMembers),
	studyGroupMessages: many(studyGroupMessages),
	user: one(users, {
		fields: [studyGroups.creatorId],
		references: [users.id]
	}),
}));

export const studyGroupTasksRelations = relations(studyGroupTasks, ({one}) => ({
	studyGroup: one(studyGroups, {
		fields: [studyGroupTasks.groupId],
		references: [studyGroups.id]
	}),
	user: one(users, {
		fields: [studyGroupTasks.assignedTo],
		references: [users.id]
	}),
}));

export const postLikesRelations = relations(postLikes, ({one}) => ({
	communityPost: one(communityPosts, {
		fields: [postLikes.postId],
		references: [communityPosts.id]
	}),
	user: one(users, {
		fields: [postLikes.userId],
		references: [users.id]
	}),
}));

export const studyGroupInvitationsRelations = relations(studyGroupInvitations, ({one}) => ({
	studyGroup: one(studyGroups, {
		fields: [studyGroupInvitations.groupId],
		references: [studyGroups.id]
	}),
	user_senderId: one(users, {
		fields: [studyGroupInvitations.senderId],
		references: [users.id],
		relationName: "studyGroupInvitations_senderId_users_id"
	}),
	user_receiverId: one(users, {
		fields: [studyGroupInvitations.receiverId],
		references: [users.id],
		relationName: "studyGroupInvitations_receiverId_users_id"
	}),
}));

export const studyGroupMaterialsRelations = relations(studyGroupMaterials, ({one}) => ({
	studyGroup: one(studyGroups, {
		fields: [studyGroupMaterials.groupId],
		references: [studyGroups.id]
	}),
	studyMaterial: one(studyMaterials, {
		fields: [studyGroupMaterials.materialId],
		references: [studyMaterials.id]
	}),
	user: one(users, {
		fields: [studyGroupMaterials.uploadedBy],
		references: [users.id]
	}),
}));

export const studyMaterialsRelations = relations(studyMaterials, ({one, many}) => ({
	studyGroupMaterials: many(studyGroupMaterials),
	studySchedules: many(studySchedules),
	user: one(users, {
		fields: [studyMaterials.userId],
		references: [users.id]
	}),
}));

export const studyGroupMembersRelations = relations(studyGroupMembers, ({one}) => ({
	studyGroup: one(studyGroups, {
		fields: [studyGroupMembers.groupId],
		references: [studyGroups.id]
	}),
	user: one(users, {
		fields: [studyGroupMembers.userId],
		references: [users.id]
	}),
}));

export const studyGroupMessagesRelations = relations(studyGroupMessages, ({one}) => ({
	studyGroup: one(studyGroups, {
		fields: [studyGroupMessages.groupId],
		references: [studyGroups.id]
	}),
	user: one(users, {
		fields: [studyGroupMessages.userId],
		references: [users.id]
	}),
}));

export const studySchedulesRelations = relations(studySchedules, ({one}) => ({
	user: one(users, {
		fields: [studySchedules.userId],
		references: [users.id]
	}),
	studyMaterial: one(studyMaterials, {
		fields: [studySchedules.materialId],
		references: [studyMaterials.id]
	}),
}));

export const userActivitiesRelations = relations(userActivities, ({one}) => ({
	user: one(users, {
		fields: [userActivities.userId],
		references: [users.id]
	}),
}));

export const userBadgesRelations = relations(userBadges, ({one}) => ({
	user: one(users, {
		fields: [userBadges.userId],
		references: [users.id]
	}),
}));

export const userChallengesRelations = relations(userChallenges, ({one}) => ({
	user: one(users, {
		fields: [userChallenges.userId],
		references: [users.id]
	}),
	challenge: one(challenges, {
		fields: [userChallenges.challengeId],
		references: [challenges.id]
	}),
}));

export const challengesRelations = relations(challenges, ({many}) => ({
	userChallenges: many(userChallenges),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
}));