CREATE TABLE `game_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`round_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`player_type` text NOT NULL,
	`career_stage` text,
	`familiarity` text DEFAULT 'new' NOT NULL,
	`venue_guess` text,
	`citation_guess` text,
	`venue_correct` integer DEFAULT false NOT NULL,
	`citation_correct` integer DEFAULT false NOT NULL,
	`skipped` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`round_id`) REFERENCES `game_rounds`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_answers_round_participant_unique` ON `game_answers` (`round_id`,`participant_id`);--> statement-breakpoint
CREATE INDEX `game_answers_benchmark_idx` ON `game_answers` (`player_type`,`skipped`);--> statement-breakpoint
CREATE TABLE `game_rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text NOT NULL,
	`selection_kind` text NOT NULL,
	`discipline_slug` text,
	`research_label` text NOT NULL,
	`benchmark_eligible` integer DEFAULT false NOT NULL,
	`requested_tier` text NOT NULL,
	`year` integer NOT NULL,
	`title` text NOT NULL,
	`abstract` text NOT NULL,
	`journal` text NOT NULL,
	`actual_venue_tier` text NOT NULL,
	`citations` integer NOT NULL,
	`citation_range` text NOT NULL,
	`retrieved_at` text NOT NULL,
	`view_url` text NOT NULL,
	`classification_note` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `game_rounds_discipline_idx` ON `game_rounds` (`discipline_slug`,`benchmark_eligible`);