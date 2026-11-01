import type { Discipline } from "@/config/disciplines";
import { openAlexMappings } from "@/config/openAlexMappings";
import { relevanceHints } from "@/config/relevanceHints";
import {
  allVenueNamesForTier,
  classificationNote,
  classifyVenue,
  classifyVenueAcrossPools,
  venueNamesForTier,
} from "@/config/venueTiers";
import {
  reconstructAbstract,
  resolveTopic,
  sampleWorks,
  sampleWorksByVenueNames,
  searchWorksByKeyword,
  type OpenAlexWork,
} from "./openalex";
import { rangeForCitations } from "./scoring";
import type { GeneratedRound, VenueTierId } from "./types";

const citationStrata = [
  { filter: "0-25", weight: 25 },
  { filter: "26-100", weight: 30 },
  { filter: "101-1000", weight: 30 },
  { filter: ">1000", weight: 15 },
];

function shuffled<T>(items: readonly T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapWith]] = [copy[swapWith], copy[index]];
  }
  return copy;
}

function chooseCitationStratum() {
  let roll = Math.random() * 100;
  for (const stratum of citationStrata) {
    roll -= stratum.weight;
    if (roll <= 0) return stratum;
  }
  return citationStrata[0];
}

function isRelevant(work: OpenAlexWork, topicId: string) {
  const normalizedTopic = topicId.split("/").pop();
  return (work.topics ?? []).some(
    (topic) => topic.id.split("/").pop() === normalizedTopic,
  );
}

const keywordStopWords = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "not",
  "of",
  "on",
  "or",
  "the",
  "to",
]);

function matchesVisibleKeyword(
  keyword: string,
  title: string,
  abstract: string,
) {
  const searchable = `${title} ${abstract}`.normalize("NFKC").toLowerCase();
  const compactSearchable = searchable.replace(/[\s\p{P}\p{S}]/gu, "");
  const terms =
    keyword
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((term) => !keywordStopWords.has(term)) ?? [];
  if (!terms.length) return false;

  return terms.every((term) => {
    if (/\p{Script=Han}/u.test(term)) {
      const compactTerm = term.replace(/[^\p{Script=Han}\p{N}]/gu, "");
      if (compactTerm.length <= 3) {
        return compactSearchable.includes(compactTerm);
      }
      const bigrams = Array.from(
        { length: compactTerm.length - 1 },
        (_, index) => compactTerm.slice(index, index + 2),
      );
      const matches = bigrams.filter((pair) =>
        compactSearchable.includes(pair),
      );
      return matches.length >= Math.ceil(bigrams.length * 0.6);
    }

    const root = term.length >= 5 ? term.slice(0, 4) : term;
    const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}[\\p{L}\\p{N}]*\\b`, "iu").test(
      searchable,
    );
  });
}

function validateWork(
  work: OpenAlexWork,
  topicId: string | undefined,
  cutoffYear: number,
  excluded: Set<string>,
  hints: string[] | undefined,
  keyword: string | undefined,
  allowConference: boolean,
) {
  if (work.language !== "en" && work.language !== "zh") return null;
  const abstract = reconstructAbstract(work.abstract_inverted_index);
  const source = work.primary_location?.source;
  const journal = source?.display_name?.trim() ?? "";
  const sourceType = source?.type ?? "journal";
  const year = work.publication_year ?? 0;
  if (excluded.has(work.id)) return null;
  if (!work.title?.trim() || work.title.trim().length < 12) return null;
  const longEnough =
    work.language === "zh"
      ? abstract.replace(/\s/g, "").length >= 180 &&
        (abstract.match(/[\u3400-\u9fff]/g)?.length ?? 0) >= 80
      : abstract.length >= 350 && abstract.split(/\s+/).length >= 55;
  if (!longEnough) return null;
  if (!journal || typeof work.cited_by_count !== "number") return null;
  if (abstract.toLowerCase().includes(journal.toLowerCase())) return null;
  if (year < 1990 || year > cutoffYear) return null;
  if (!work.id || !["article", "review"].includes(work.type ?? "")) return null;
  if (
    sourceType !== "journal" &&
    !(allowConference && sourceType === "conference")
  ) {
    return null;
  }
  if (topicId && !isRelevant(work, topicId)) return null;
  if (hints?.length) {
    const searchable = `${work.title} ${abstract}`.toLowerCase();
    if (!hints.some((hint) => searchable.includes(hint))) return null;
  }
  if (keyword && !matchesVisibleKeyword(keyword, work.title, abstract)) {
    return null;
  }
  return { abstract, journal, sourceType, year };
}

function createRound(
  work: OpenAlexWork,
  valid: {
    abstract: string;
    journal: string;
    sourceType: string;
    year: number;
  },
  venueTier: VenueTierId,
): GeneratedRound {
  const citations = work.cited_by_count as number;
  const viewUrl = work.doi
    ? work.doi.startsWith("http")
      ? work.doi
      : `https://doi.org/${work.doi}`
    : work.id;
  return {
    paper: {
      id: work.id,
      year: valid.year,
      title: work.title!.trim(),
      abstract: valid.abstract,
    },
    answer: {
      journal: valid.journal,
      venueTier,
      citations,
      citationRange: rangeForCitations(citations),
      retrievedAt: new Date().toISOString(),
      viewUrl,
      source: "OpenAlex",
      classificationNote: classificationNote(venueTier),
    },
  };
}

export async function findRound(
  discipline: Discipline,
  requestedTier: VenueTierId,
  excludedIds: string[],
  signal?: AbortSignal,
): Promise<GeneratedRound> {
  const terms = openAlexMappings[discipline.slug];
  if (!terms?.length) throw new Error("Discipline mapping is missing");
  const topic = await resolveTopic(terms, signal);
  const cutoffYear = new Date().getUTCFullYear() - 10;
  const excluded = new Set(excludedIds);
  const hints = relevanceHints[discipline.slug];
  const preferred = chooseCitationStratum();
  const attempts = [
    preferred,
    ...shuffled(citationStrata.filter((stratum) => stratum !== preferred)),
  ];
  const venueNames = venueNamesForTier(discipline.poolKey, requestedTier);

  for (const stratum of attempts) {
    const seed = Math.floor(Math.random() * 2_000_000_000);
    const works =
      requestedTier === "other"
        ? shuffled(
            await sampleWorks(
              topic,
              stratum.filter,
              cutoffYear,
              seed,
              signal,
            ),
          )
        : shuffled(
            await sampleWorksByVenueNames(
              topic,
              venueNames,
              stratum.filter,
              cutoffYear,
              seed,
              undefined,
              signal,
            ),
          );

    for (const work of works) {
      const valid = validateWork(
        work,
        topic.id,
        cutoffYear,
        excluded,
        hints,
        undefined,
        discipline.poolKey === "computer-science" &&
          requestedTier === "flagship",
      );
      if (!valid) continue;
      const actualTier = classifyVenue(
        valid.journal,
        discipline.poolKey,
        valid.sourceType,
      );
      if (actualTier !== requestedTier) continue;
      return createRound(work, valid, actualTier);
    }
  }
  throw new Error("No suitable paper found after balanced-tier retries");
}

export async function findRoundByKeyword(
  keyword: string,
  requestedTier: VenueTierId,
  excludedIds: string[],
  signal?: AbortSignal,
): Promise<GeneratedRound> {
  const cutoffYear = new Date().getUTCFullYear() - 10;
  const excluded = new Set(excludedIds);
  const preferred = chooseCitationStratum();
  const attempts = [
    preferred,
    ...shuffled(citationStrata.filter((stratum) => stratum !== preferred)),
  ];
  const venueNames = allVenueNamesForTier(requestedTier);

  for (const stratum of attempts) {
    const seed = Math.floor(Math.random() * 2_000_000_000);
    const works =
      requestedTier === "other"
        ? shuffled(
            await searchWorksByKeyword(
              keyword,
              stratum.filter,
              cutoffYear,
              signal,
            ),
          )
        : shuffled(
            await sampleWorksByVenueNames(
              undefined,
              venueNames,
              stratum.filter,
              cutoffYear,
              seed,
              keyword,
              signal,
            ),
          );

    for (const work of works) {
      const valid = validateWork(
        work,
        undefined,
        cutoffYear,
        excluded,
        undefined,
        keyword,
        requestedTier === "flagship",
      );
      if (!valid) continue;
      const actualTier = classifyVenueAcrossPools(
        valid.journal,
        valid.sourceType,
      );
      if (actualTier !== requestedTier) continue;
      return createRound(work, valid, actualTier);
    }
  }
  throw new Error("No suitable paper found for this keyword and tier");
}
