ALTER TYPE "public"."notification_type" ADD VALUE 'friend_accept' BEFORE 'message';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'friend_reject' BEFORE 'message';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'friend_post';