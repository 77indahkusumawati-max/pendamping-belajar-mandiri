CREATE TABLE `quizAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quizKey` varchar(64) NOT NULL,
	`score` int NOT NULL,
	`total` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studyProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskState` text NOT NULL,
	`completedMaterials` text NOT NULL,
	`dailyTargetMinutes` int NOT NULL DEFAULT 30,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studyProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `studyProgress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
