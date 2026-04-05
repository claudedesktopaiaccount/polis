CREATE TABLE `prediction_narrative` (
	`id` text PRIMARY KEY NOT NULL,
	`input_hash` text NOT NULL,
	`narrative` text NOT NULL,
	`generated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `party_promises` ADD `status` text DEFAULT 'not_started' NOT NULL;