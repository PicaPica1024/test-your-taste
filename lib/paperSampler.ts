import type { Discipline } from "@/config/disciplines";
import { openAlexMappings } from "@/config/openAlexMappings";
import { relevanceHints } from "@/config/relevanceHints";
import { buildJournalOptions } from "./journalOptions";
import {
  reconstructAbstract,
  resolveTopic,
  sampleWorks,
  type OpenAlexWork,
} from "./openalex";
import { rangeForCitations } from "./scoring";
import type { Round } from "./types";

const strata = [
  { filter: "0-25", weight: 25 },
  { filter: "26-100", weight: 30 },
  { filter: "101-1000", weight: 30 },
  { filter: ">1000", weight: 15 },
];

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function chooseStratum() {
  let roll = Math.random() * 100;
  for (const stratum of strata) {
    roll -= stratum.weight;
    if (roll <= 0) return stratum;
  }
  return strata[0];
}

function isRelevant(work: OpenAlexWork, topicId: string) {
  const normalizedTopic = topicId.split("/").pop();
  return (work.topics ?? []).some(
    (topic) => topic.id.split("/").pop() === normalizedTopic,
  );
}

function validateWork(
  work: OpenAlexWork,
  topicId: string,
  _subfieldId: string | undefined,
  cutoffYear: number,
  excluded: Set<string>,
  hints: string[] | undefined,
) {
  const abstract = reconstructAbstract(work.abstract_inverted_index);
  const journal = work.primary_location?.source?.display_name?.trim() ?? "";
  const year = work.publication_year ?? 0;
  if (excluded.has(work.id)) return null;
  if (!work.title?.trim() || work.title.trim().length < 12) return null;
  if (abstract.length < 350 || abstract.split(/\s+/).length < 55) return null;
  if (!journal || typeof work.cited_by_count !== "number") return null;
  // Some source records prepend a full citation to the abstract. Reject them
  // because that header can expose the hidden journal before the guess.
  if (abstract.toLowerCase().includes(journal.toLowerCase())) return null;
  if (year < 1900 || year > cutoffYear) return null;
  if (!work.id || !["article", "review"].includes(work.type ?? "")) return null;
  if (work.primary_location?.source?.type && work.primary_location.source.type !== "journal") return null;
  if (!isRelevant(work, topicId)) return null;
  if (hints?.length) {
    const searchable = `${work.title} ${abstract}`.toLowerCase();
    if (!hints.some((hint) => searchable.includes(hint))) return null;
  }
  return { abstract, journal, year };
}

export async function findRound(
  discipline: Discipline,
  excludedIds: string[],
  signal?: AbortSignal,
): Promise<Round> {
  const terms = openAlexMappings[discipline.slug];
  if (!terms?.length) throw new Error("Discipline mapping is missing");
  const topic = await resolveTopic(terms, signal);
  const cutoffYear = new Date().getUTCFullYear() - 10;
  const excluded = new Set(excludedIds);
  const hints = relevanceHints[discipline.slug];
  const preferred = chooseStratum();
  const attempts = [preferred, ...shuffled(strata.filter((s) => s !== preferred))];

  for (const stratum of attempts) {
    const seed = Math.floor(Math.random() * 2_000_000_000);
    const works = shuffled(
      await sampleWorks(topic, stratum.filter, cutoffYear, seed, signal),
    );

    for (const work of works) {
      const valid = validateWork(
        work,
        topic.id,
        topic.subfield?.id,
        cutoffYear,
        excluded,
        hints,
      );
      if (!valid) continue;
      const journalOptions = buildJournalOptions(
        valid.journal,
        discipline.poolKey,
        valid.year,
        work.id,
      );
      if (journalOptions.length !== 6) continue;

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
        journalOptions,
        answer: {
          journal: valid.journal,
          citations,
          citationRange: rangeForCitations(citations),
          retrievedAt: new Date().toISOString(),
          viewUrl,
          source: "OpenAlex",
        },
      };
    }
  }
  throw new Error("No suitable paper found after retries");
}
