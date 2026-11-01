import { getDb } from "@/db";
import { gameAnswers, gameRounds } from "@/db/schema";
import {
  careerStages,
  citationRanges,
  venueTiers,
  type CareerStageId,
  type CitationRangeId,
  type PlayerType,
  type RoundResult,
  type VenueTierId,
} from "@/lib/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

const tierIds = new Set<string>(venueTiers.map((item) => item.id));
const rangeIds = new Set<string>(citationRanges.map((item) => item.id));
const stageIds = new Set<string>(careerStages.map((item) => item.id));

function participant(value: unknown) {
  return typeof value === "string" && /^[a-zA-Z0-9-]{8,80}$/.test(value) ? value : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const roundId = typeof body.roundId === "string" ? body.roundId : "";
    const participantId = participant(body.participantId);
    const venueGuess = typeof body.venueTier === "string" && tierIds.has(body.venueTier)
      ? (body.venueTier as VenueTierId)
      : null;
    const citationGuess = typeof body.citationRange === "string" && rangeIds.has(body.citationRange)
      ? (body.citationRange as CitationRangeId)
      : null;
    const playerType: PlayerType = body.playerType === "ai" ? "ai" : "human";
    const careerStage = typeof body.careerStage === "string" && stageIds.has(body.careerStage)
      ? (body.careerStage as CareerStageId)
      : null;
    if (!roundId || !participantId || !venueGuess || !citationGuess) {
      return NextResponse.json({ error: "The answer is incomplete." }, { status: 400 });
    }

    const db = getDb();
    const round = await db.query.gameRounds.findFirst({ where: eq(gameRounds.id, roundId) });
    if (!round) return NextResponse.json({ error: "Round not found." }, { status: 404 });

    const venueCorrect = venueGuess === round.actualVenueTier;
    const citationCorrect = citationGuess === round.citationRange;
    await db.insert(gameAnswers).values({
      roundId,
      participantId,
      playerType,
      careerStage,
      familiarity: "new",
      venueGuess,
      citationGuess,
      venueCorrect,
      citationCorrect,
      skipped: false,
    }).onConflictDoNothing();

    const result: RoundResult = {
      score: Number(venueCorrect) + Number(citationCorrect),
      venueCorrect,
      citationCorrect,
      actualJournal: round.journal,
      actualVenueTier: round.actualVenueTier as VenueTierId,
      actualCitations: round.citations,
      actualCitationRange: round.citationRange as CitationRangeId,
      retrievedAt: round.retrievedAt,
      viewUrl: round.viewUrl,
      classificationNote: round.classificationNote,
    };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Answer submission failed", error);
    return NextResponse.json({ error: "Could not record the answer." }, { status: 500 });
  }
}
