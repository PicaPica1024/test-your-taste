ALTER TABLE `game_answers` ADD `answer_mode` text DEFAULT 'tier-v1' NOT NULL;--> statement-breakpoint
ALTER TABLE `game_answers` ADD `journal_guess` text;--> statement-breakpoint
ALTER TABLE `game_answers` ADD `journal_correct` integer DEFAULT false NOT NULL;