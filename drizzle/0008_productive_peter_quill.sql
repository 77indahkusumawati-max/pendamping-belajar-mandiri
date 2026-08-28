ALTER TABLE `uploadedMaterials` ADD `category` varchar(80) DEFAULT 'Umum' NOT NULL;--> statement-breakpoint
ALTER TABLE `uploadedMaterials` ADD `tags` text DEFAULT ('') NOT NULL;