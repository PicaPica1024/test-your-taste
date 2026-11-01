import { disciplinesBySlug } from "@/config/disciplines";
import { getDb } from "@/db";
import { gameAnswers, gameRounds } from "@/db/schema";
import type { BenchmarkSummary } from "@/lib/types";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get("discipline") ?? "";
    if (!disciplinesBySlug.has(slug)) {
      return NextResponse.json({ error: "Benchmark statistics require a preset discipline." }, { status: 400 });
    }
    const rows = await getDb()
      .select({
        playerType: gameAnswers.playerType,
        answers: sql<number>`count(*)`,
        venueCorrect: sql<number>`coalesce(sum(case when ${gameAnswers.venueCorrect} = 1 then 1 else 0 end), 0)`,
        citationCorrect: sql<number>`coalesce(sum(case when ${gameAnswers.citationCorrect} = 1 then 1 else 0 end), 0)`,
      })
      .from(gameAnswers)
      .innerJoin(gameRounds, eq(gameAnswers.roundId, gameRounds.id))
      .where(and(
        eq(gameRounds.disciplineSlug, slug),
        eq(gameRounds.benchmarkEligible, true),
        eq(gameAnswers.skipped, false),
      ))
      .groupBy(gameAnswers.playerType);
    const summaries: BenchmarkSummary[] = rows
      .filter((row) => row.playerType === "human" || row.playerType === "ai")
      .map((row) => ({
        playerType: row.playerType as "human" | "ai",
        answers: Number(row.answers),
        venueCorrect: Number(row.venueCorrect),
        citationCorrect: Number(row.citationCorrect),
      }));
    return NextResponse.json({ discipline: slug, summaries }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Benchmark statistics failed", error);
    return NextResponse.json({ error: "Benchmark statistics are unavailable." }, { status: 500 });
  }
}
