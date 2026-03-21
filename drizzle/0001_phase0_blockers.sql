CREATE TABLE `rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_ip_hash_idx` ON `rate_limits` (`ip_hash`);
--> statement-breakpoint
CREATE INDEX `rate_limits_created_at_idx` ON `rate_limits` (`created_at`);
--> statement-breakpoint
ALTER TABLE `user_predictions` ADD COLUMN `fingerprint` text;
--> statement-breakpoint
UPDATE `user_predictions` SET `fingerprint` = `region` WHERE `region` IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX `crowd_aggregates_party_id_unique` ON `crowd_aggregates` (`party_id`);
