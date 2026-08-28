CREATE TABLE `managedMaterials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(120) NOT NULL,
	`title` varchar(180) NOT NULL,
	`summary` text NOT NULL,
	`steps` text NOT NULL,
	`source` varchar(255) NOT NULL,
	`level` varchar(32) NOT NULL,
	`difficulty` varchar(32) NOT NULL,
	`track` varchar(80) NOT NULL,
	`createdBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `managedMaterials_id` PRIMARY KEY(`id`),
	CONSTRAINT `managedMaterials_subject_unique` UNIQUE(`subject`)
);
--> statement-breakpoint
CREATE TABLE `studyPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interests` text NOT NULL,
	`preferredTrack` varchar(80) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studyPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `studyPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `uploadedMaterials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` varchar(1024) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploadedMaterials_id` PRIMARY KEY(`id`)
);
