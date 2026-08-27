ALTER TABLE `studyProgress` MODIFY COLUMN `weeklyActivity` text NOT NULL;--> statement-breakpoint
ALTER TABLE `studyProgress` ADD `reminderEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `studyProgress` ADD `reminderTime` varchar(5) DEFAULT '19:00' NOT NULL;