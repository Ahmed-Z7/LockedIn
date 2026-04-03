ALTER TYPE "public"."notification_type" ADD VALUE 'friend_request';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'message';--> statement-breakpoint
CREATE TABLE "aiConversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(200) DEFAULT 'New Concept' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friends" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"friendId" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"isFavorite" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aiChatHistory" ADD COLUMN "conversationId" integer;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD COLUMN "status" text DEFAULT 'Ana LOCKEDIN';--> statement-breakpoint
ALTER TABLE "userProfiles" ADD COLUMN "avatarFrame" varchar(50) DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "aiConversations" ADD CONSTRAINT "aiConversations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_friendId_users_id_fk" FOREIGN KEY ("friendId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiChatHistory" ADD CONSTRAINT "aiChatHistory_conversationId_aiConversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."aiConversations"("id") ON DELETE no action ON UPDATE no action;