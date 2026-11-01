import { getDb } from "@/db";
import { gameAnswers, gameRounds } from "@/db/schema";
import { careerStages, type CareerStageId } from "@/lib/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

const stageIds = new Set<string>(careerStages.map((item) => item.id));

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const roundId = typeof body.roundId === "string" ? body.roundId : "";
    const participantId = typeof body.participantId === "string" && /^[a-zA-Z0-9-]{8,80}$/.test(body.participantId)
      ? body.participantId
      : null;
    const familiarity = body.familiarity === "read" ? "read" : "unsure";
    const playerType = body.playerType === "ai" ? "ai" : "human";
    const careerStage = typeof body.careerStage === "string" && stageIds.has(body.careerStage)
      ? (body.careerStage as CareerStageId)
      : null;
    if (!roundId || !participantId) {
      return NextResponse.json({ error: "Round information is missing." }, { status: 400 });
    }
    const db = getDb();
    const round = await db.query.gameRounds.findFirst({ columns: { id: true }, where: eq(gameRounds.id, roundId) });
    if (!round) return NextResponse.json({ error: "Round not found." }, { status: 404 });
    await db.insert(gameAnswers).values({
      roundId,
      participantId,
      playerType,
      careerStage,
      familiarity,
      venueCorrect: false,
      citationCorrect: false,
      skipped: true,
    }).onConflictDoNothing();
    return NextResponse.json({ status: "skipped" });
  } catch (error) {
    console.error("Skip submission failed", error);
    return NextResponse.json({ error: "Could not skip this paper." }, { status: 500 });
  }
}
