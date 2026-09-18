import { disciplinesBySlug } from "@/config/disciplines";
import { OpenAlexError } from "@/lib/openalex";
import { findRound } from "@/lib/paperSampler";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      discipline?: string;
      excludedIds?: unknown;
    };
    const discipline = body.discipline
      ? disciplinesBySlug.get(body.discipline)
      : undefined;
    if (!discipline) {
      return NextResponse.json(
        { error: "Choose a valid research field." },
        { status: 400 },
      );
    }
    const excludedIds = Array.isArray(body.excludedIds)
      ? body.excludedIds.filter(
          (value): value is string => typeof value === "string",
        ).slice(-100)
      : [];
    const round = await findRound(discipline, excludedIds, request.signal);
    return NextResponse.json(round, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const details =
      error instanceof OpenAlexError
        ? { code: error.code, status: error.status, message: error.message }
        : {
            code: "PAPER_SELECTION_FAILED",
            message: error instanceof Error ? error.message : String(error),
          };
    console.error("Paper retrieval failed", JSON.stringify(details));

    const publicError =
      error instanceof OpenAlexError
        ? {
            OPENALEX_KEY_MISSING:
              "The paper source is not configured. Add OPENALEX_API_KEY to the Site environment.",
            OPENALEX_AUTH_FAILED:
              "The OpenAlex API key was rejected or its anonymous allowance is exhausted.",
            OPENALEX_RATE_LIMITED:
              "OpenAlex is temporarily rate-limited. Please try again shortly.",
            OPENALEX_UPSTREAM_ERROR:
              "OpenAlex is temporarily unavailable. Please try again shortly.",
          }[error.code]
        : "No suitable paper passed the quality checks for this sample. Please try again.";

    return NextResponse.json(
      { error: publicError, code: details.code },
      { status: 503 },
    );
  }
}
