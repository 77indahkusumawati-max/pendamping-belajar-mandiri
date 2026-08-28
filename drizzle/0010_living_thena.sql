CREATE TABLE `uploadedQuizAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`uploadId` int NOT NULL,
	`score` int NOT NULL,
	`total` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploadedQuizAttempts_id` PRIMARY KEY(`id`)
);
