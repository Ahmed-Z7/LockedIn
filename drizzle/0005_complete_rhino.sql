ALTER TYPE "public"."notification_type" ADD VALUE 'group_post_like';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'group_post_comment';--> statement-breakpoint
CREATE TABLE "studyGroupPostComments" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studyGroupPostLikes" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "groupPostId" integer;--> statement-breakpoint
ALTER TABLE "studyGroupPostComments" ADD CONSTRAINT "studyGroupPostComments_postId_studyGroupPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."studyGroupPosts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupPostComments" ADD CONSTRAINT "studyGroupPostComments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupPostLikes" ADD CONSTRAINT "studyGroupPostLikes_postId_studyGroupPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."studyGroupPosts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studyGroupPostLikes" ADD CONSTRAINT "studyGroupPostLikes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_groupPostId_studyGroupPosts_id_fk" FOREIGN KEY ("groupPostId") REFERENCES "public"."studyGroupPosts"("id") ON DELETE no action ON UPDATE no action;