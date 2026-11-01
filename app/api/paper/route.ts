import { disciplinesBySlug } from "@/config/disciplines";
import { getDb } from "@/db";
import { gameRounds } from "@/db/schema";
import { OpenAlexError } from "@/lib/openalex";
import { buildJournalOptions, inferPoolKey } from "@/lib/journalOptions";
import { findRound, findRoundByKeyword } from "@/lib/paperSampler";
import { venueTiers, type VenueTierId } from "@/lib/types";
import { NextResponse } from "next/server";

export const runtime = "edge";

const validTiers = new Set<string>(venueTiers.map((tier) => tier.id));

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      discipline?: string;
      keyword?: string;
      requestedTier?: unknown;
      excludedIds?: unknown;
    };
    const requestedTier =
      typeof body.requestedTier === "string" && validTiers.has(body.requestedTier)
        ? (body.requestedTier as VenueTierId)
        : null;
    if (!requestedTier) {
      return NextResponse.json({ error: "A valid venue tier is required." }, { status: 400 });
    }

    const discipline = body.discipline ? disciplinesBySlug.get(body.discipline) : undefined;
    const keyword = typeof body.keyword === "string"
      ? body.keyword.trim().replace(/\s+/g, " ")
      : "";
    if (!discipline && (!keyword || keyword.length < 2 || keyword.length > 120)) {
      return NextResponse.json(
        { error: "Choose a valid research field or enter 2–120 characters of keywords." },
        { status: 400 },
      );
    }
    const excludedIds = Array.isArray(body.excludedIds)
      ? body.excludedIds.filter((value): value is string => typeof value === "string").slice(-100)
      : [];
    const generated = discipline
      ? await findRound(discipline, requestedTier, excludedIds, request.signal)
      : await findRoundByKeyword(keyword, requestedTier, excludedIds, request.signal);
    const journalOptions = buildJournalOptions(
      generated.answer.journal,
      generated.answer.venueTier,
      discipline?.poolKey ?? inferPoolKey(keyword),
    );
    const roundId = crypto.randomUUID();
    await getDb().insert(gameRounds).values({
      id: roundId,
      paperId: generated.paper.id,
      selectionKind: discipline ? "discipline" : "keyword",
      disciplineSlug: discipline?.slug ?? null,
      researchLabel: discipline?.name ?? keyword,
      benchmarkEligible: Boolean(discipline),
      requestedTier,
      year: generated.paper.year,
      title: generated.paper.title,
      abstract: generated.paper.abstract,
      journal: generated.answer.journal,
      actualVenueTier: generated.answer.venueTier,
      citations: generated.answer.citations,
      citationRange: generated.answer.citationRange,
      retrievedAt: generated.answer.retrievedAt,
      viewUrl: generated.answer.viewUrl,
      classificationNote: generated.answer.classificationNote,
    });

    return NextResponse.json(
      { roundId, paper: generated.paper, requestedTier, journalOptions },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const details = error instanceof OpenAlexError
      ? { code: error.code, status: error.status, message: error.message }
      : { code: "PAPER_SELECTION_FAILED", message: error instanceof Error ? error.message : String(error) };
    console.error("Paper retrieval failed", JSON.stringify(details));

    const publicError = error instanceof OpenAlexError
      ? {
          OPENALEX_KEY_MISSING: "The paper source is not configured. Add OPENALEX_API_KEY to the Site environment.",
          OPENALEX_AUTH_FAILED: "The OpenAlex API key was rejected or its anonymous allowance is exhausted.",
          OPENALEX_RATE_LIMITED: "OpenAlex is temporarily rate-limited. Please try again shortly.",
          OPENALEX_UPSTREAM_ERROR: "OpenAlex is temporarily unavailable. Please try again shortly.",
        }[error.code]
      : details.message.includes("D1") || details.message.includes("no such table")
        ? "The game database is not ready yet. Please try again after the latest deployment finishes."
        : "No suitable paper passed the quality checks for this tier. Please try again.";

    return NextResponse.json({ error: publicError, code: details.code }, { status: 503 });
  }
}
