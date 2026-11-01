import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const gameRounds = sqliteTable(
  "game_rounds",
  {
    id: text("id").primaryKey(),
    paperId: text("paper_id").notNull(),
    selectionKind: text("selection_kind").notNull(),
    disciplineSlug: text("discipline_slug"),
    researchLabel: text("research_label").notNull(),
    benchmarkEligible: integer("benchmark_eligible", { mode: "boolean" }).notNull().default(false),
    requestedTier: text("requested_tier").notNull(),
    year: integer("year").notNull(),
    title: text("title").notNull(),
    abstract: text("abstract").notNull(),
    journal: text("journal").notNull(),
    actualVenueTier: text("actual_venue_tier").notNull(),
    citations: integer("citations").notNull(),
    citationRange: text("citation_range").notNull(),
    retrievedAt: text("retrieved_at").notNull(),
    viewUrl: text("view_url").notNull(),
    classificationNote: text("classification_note").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("game_rounds_discipline_idx").on(table.disciplineSlug, table.benchmarkEligible),
  ],
);

export const gameAnswers = sqliteTable(
  "game_answers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roundId: text("round_id").notNull().references(() => gameRounds.id),
    participantId: text("participant_id").notNull(),
    playerType: text("player_type").notNull(),
    careerStage: text("career_stage"),
    familiarity: text("familiarity").notNull().default("new"),
    answerMode: text("answer_mode").notNull().default("tier-v1"),
    venueGuess: text("venue_guess"),
    journalGuess: text("journal_guess"),
    citationGuess: text("citation_guess"),
    venueCorrect: integer("venue_correct", { mode: "boolean" }).notNull().default(false),
    journalCorrect: integer("journal_correct", { mode: "boolean" }).notNull().default(false),
    citationCorrect: integer("citation_correct", { mode: "boolean" }).notNull().default(false),
    skipped: integer("skipped", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("game_answers_round_participant_unique").on(table.roundId, table.participantId),
    index("game_answers_benchmark_idx").on(table.playerType, table.skipped),
  ],
);
