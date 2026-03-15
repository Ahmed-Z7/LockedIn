CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromUserId` int NOT NULL,
	`postId` int,
	`commentId` int,
	`type` enum('like','comment','follow') NOT NULL,
	`read` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `userProfiles` RENAME COLUMN `avatar` TO `badgesCount`;--> statement-breakpoint
ALTER TABLE `userProfiles` MODIFY COLUMN `level` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `userProfiles` MODIFY COLUMN `badgesCount` int NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` MODIFY COLUMN `badgesCount` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `profilePhoto` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_fromUserId_users_id_fk` FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_postId_communityPosts_id_fk` FOREIGN KEY (`postId`) REFERENCES `communityPosts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_commentId_postComments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `postComments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `postComments` DROP COLUMN `likes`;