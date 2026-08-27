CREATE TABLE `materialBookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `materialBookmarks_id` PRIMARY KEY(`id`),
	CONSTRAINT `materialBookmarks_user_subject` UNIQUE(`userId`,`subject`)
);
--> statement-breakpoint
CREATE TABLE `materialComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(120) NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `materialComments_id` PRIMARY KEY(`id`)
);
