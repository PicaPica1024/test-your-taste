import { disciplinesBySlug } from "@/config/disciplines";
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
    console.error("Paper retrieval failed", error);
    return NextResponse.json(
      { error: "Couldn't find a suitable paper. Try again." },
      { status: 503 },
    );
  }
}
