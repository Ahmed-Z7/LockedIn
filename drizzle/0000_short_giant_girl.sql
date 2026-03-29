-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."category" AS ENUM('study_time', 'streak', 'focus', 'group', 'ai_usage', 'consistency');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."group_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."group_status" AS ENUM('pending', 'approved');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('like', 'comment', 'follow', 'badge', 'study_session');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."rarity" AS ENUM('common', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."sessionType" AS ENUM('study', 'review');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'completed');--> statement-breakpoint
CREATE TABLE "studySessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"subject" varchar(100) NOT NULL,
	"duration" integer NOT NULL,
	"focusScore" integer DEFAULT 0,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiChatHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"message" text NOT NULL,
	"response" text,
	"topic" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "directMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"senderId" integer NOT NULL,
	"receiverId" integer NOT NULL,
	"content" text NOT NULL,
	"read" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashCardDecks" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(100),
	"cardCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashCards" (
	"id" serial PRIMARY KEY NOT NULL,
	"deckId" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"difficulty" "difficulty" DEFAULT 'medium',
	"reviewCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"fromUserId" integer NOT NULL,
	"postId" integer,
	"commentId" integer,
	"type" "notification_type" NOT NULL,
	"read" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blockedWebsites" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"domain" varchar(255) NOT NULL,
	"reason" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communityPosts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100) DEFAULT 'general',
	"likes" integer DEFAULT 0,
	"commentsCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"category" "category" NOT NULL,
	"targetValue" integer NOT NULL,
	"rewardXp" integer NOT NULL,
	"rewardBadgeName" varchar(100),
	"difficulty" "difficulty" DEFAULT 'easy'
);
--> statement-breakpoint
CREATE TABLE "studyGroupPosts" (
	"id" serial PRIMARY KEY NOT NULL,
	"groupId" integer NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studyGroupTasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"groupId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'open' NOT NULL,
	"dueDate" timestamp,
	"assignedTo" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postComments" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postLikes" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studyGroupInvitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"groupId" integer NOT NULL,
	"senderId" integer NOT NULL,
	"receiverId" integer NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studyGroupMaterials" (
	"id" serial PRIMARY KEY NOT NULL,
	"groupId" integer NOT NULL,
	"materialId" integer NOT NULL,
	"uploadedBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studyGroupMembers" (
	"id" serial PRIMARY KEY NOT NULL,
	"groupId" integer NOT NULL,
	"userId" integer NOT NULL,
	"role" "group_role" DEFAULT 'member' NOT NULL,
	"status" "group_status" DEFAULT 'approved' NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studyGroupMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"groupId" integer NOT NULL,
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studySchedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"subject" varchar(100) NOT NULL,
	"scheduledTime" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"priority" "priority" DEFAULT 'medium',
	"difficulty" "difficulty" DEFAULT 'medium',
	"sessionType" "sessionType" DEFAULT 'study',
	"completed" integer DEFAULT 0,
	"materialId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studyGroups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"creatorId" integer NOT NULL,
	"avatar" text,
	"isPrivate" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studyMaterials" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text,
	"fileUrl" varchar(500),
	"type" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"username" varchar(100),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "userActivities" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"xpGain" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userBadges" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"badgeName" varchar(100) NOT NULL,
	"badgeIcon" varchar(100) NOT NULL,
	"rarity" "rarity" DEFAULT 'common',
	"description" text,
	"earnedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userChallenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"challengeId" integer NOT NULL,
	"currentProgress" integer DEFAULT 0 NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL,
	"completedAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userProfiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"streakLongest" integer DEFAULT 0 NOT NULL,
	"totalStudyTime" integer DEFAULT 0 NOT NULL,
	"lastStudyDate" timestamp,
	"bio" text,
	"profilePhoto" text,
	"rank" varchar(100) DEFAULT 'Focused Beginner',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"achievementNotifications" integer DEFAULT 1,
	"socialNotifications" integer DEFAULT 1,
	"messageNotifications" integer DEFAULT 1,
	"challengeReminders" integer DEFAULT 1,
	"weeklyDigest" integer DEFAULT 1,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userSettings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "studySessions" ADD CONSTRAINT "studySessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiChatHistory" ADD CONSTRAINT "aiChatHistory_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessages" ADD CONSTRAINT "directMessages_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessages" ADD CONSTRAINT "directMessages_receiverId_users_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashCardDecks" ADD CONSTRAINT "flashCardDecks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashCards" ADD CONSTRAINT "flashCards_deckId_flashCardDecks_id_fk" FOREIGN KEY ("deckId") REFERENCES "public"."flashCardDecks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_fromUserId_users_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_postId_communityPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."communityPosts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_commentId_postComments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."postComments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockedWebsites" ADD CONSTRAINT "blockedWebsites_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communityPosts" ADD CONSTRAINT "communityPosts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupPosts" ADD CONSTRAINT "studyGroupPosts_groupId_studyGroups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."studyGroups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupPosts" ADD CONSTRAINT "studyGroupPosts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupTasks" ADD CONSTRAINT "studyGroupTasks_groupId_studyGroups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."studyGroups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupTasks" ADD CONSTRAINT "studyGroupTasks_assignedTo_users_id_fk" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postComments" ADD CONSTRAINT "postComments_postId_communityPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."communityPosts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postComments" ADD CONSTRAINT "postComments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_postId_communityPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."communityPosts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupInvitations" ADD CONSTRAINT "studyGroupInvitations_groupId_studyGroups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."studyGroups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupInvitations" ADD CONSTRAINT "studyGroupInvitations_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupInvitations" ADD CONSTRAINT "studyGroupInvitations_receiverId_users_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupMaterials" ADD CONSTRAINT "studyGroupMaterials_groupId_studyGroups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."studyGroups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupMaterials" ADD CONSTRAINT "studyGroupMaterials_materialId_studyMaterials_id_fk" FOREIGN KEY ("materialId") REFERENCES "public"."studyMaterials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupMaterials" ADD CONSTRAINT "studyGroupMaterials_uploadedBy_users_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupMembers" ADD CONSTRAINT "studyGroupMembers_groupId_studyGroups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."studyGroups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupMembers" ADD CONSTRAINT "studyGroupMembers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupMessages" ADD CONSTRAINT "studyGroupMessages_groupId_studyGroups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."studyGroups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupMessages" ADD CONSTRAINT "studyGroupMessages_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studySchedules" ADD CONSTRAINT "studySchedules_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studySchedules" ADD CONSTRAINT "studySchedules_materialId_studyMaterials_id_fk" FOREIGN KEY ("materialId") REFERENCES "public"."studyMaterials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroups" ADD CONSTRAINT "studyGroups_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyMaterials" ADD CONSTRAINT "studyMaterials_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userActivities" ADD CONSTRAINT "userActivities_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBadges" ADD CONSTRAINT "userBadges_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userChallenges" ADD CONSTRAINT "userChallenges_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userChallenges" ADD CONSTRAINT "userChallenges_challengeId_challenges_id_fk" FOREIGN KEY ("challengeId") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD CONSTRAINT "userProfiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userSettings" ADD CONSTRAINT "userSettings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
*/