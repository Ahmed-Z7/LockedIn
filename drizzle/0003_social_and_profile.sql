-- Migration 0003: Add status, avatarFrame to userProfiles + Create friends table
ALTER TABLE "userProfiles" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'Ana LOCKEDIN';--> statement-breakpoint
ALTER TABLE "userProfiles" ADD COLUMN IF NOT EXISTS "avatarFrame" varchar(50) DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "userProfiles" ADD COLUMN IF NOT EXISTS "rank" varchar(100) DEFAULT 'Focused Beginner';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "friends" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"friendId" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"isFavorite" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_friendId_users_id_fk" FOREIGN KEY ("friendId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
