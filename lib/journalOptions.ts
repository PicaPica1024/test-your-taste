import { approximatePrestige } from "@/config/journalPrestige";
import { journalPools } from "@/config/journalPools";
import type { OpenAlexWork } from "./openalex";

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function buildJournalOptions(
  actualJournal: string,
  poolKey: string,
  publicationYear: number,
  roundSeed: string,
) {
  const pool = journalPools[poolKey] ?? [];
  const eligible = pool.filter(
    (entry) =>
      entry.name.toLowerCase() !== actualJournal.toLowerCase() &&
      (!entry.established || entry.established <= publicationYear),
  );

  const distractors = [...eligible]
    .sort(
      (left, right) =>
        hash(`${roundSeed}:${left.name}`) - hash(`${roundSeed}:${right.name}`),
    )
    .slice(0, 5);

  if (distractors.length < 5) return [];

  return [
    ...distractors,
    {
      name: actualJournal,
      prestigeTier: approximatePrestige(actualJournal, pool),
    },
  ]
    .sort(
      (left, right) =>
        left.prestigeTier - right.prestigeTier ||
        hash(`${roundSeed}:order:${left.name}`) -
          hash(`${roundSeed}:order:${right.name}`),
    )
    .map(({ name }) => ({ name }));
}

export function buildKeywordJournalOptions(
  actualJournal: string,
  candidates: OpenAlexWork[],
  publicationYear: number,
  roundSeed: string,
) {
  const knownJournals = Object.values(journalPools).flat();
  const seen = new Set([actualJournal.toLowerCase()]);
  const related = candidates
    .filter((work) => (work.publication_year ?? 0) <= publicationYear)
    .map((work) => work.primary_location?.source)
    .filter((source) => source?.display_name && (!source.type || source.type === "journal"))
    .map((source) => source!.display_name.trim())
    .filter((name) => {
      const normalized = name.toLowerCase();
      if (!name || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .sort(
      (left, right) =>
        hash(`${roundSeed}:related:${left}`) -
        hash(`${roundSeed}:related:${right}`),
    );

  const fallback = knownJournals
    .filter(
      (entry) =>
        (!entry.established || entry.established <= publicationYear) &&
        !seen.has(entry.name.toLowerCase()),
    )
    .sort(
      (left, right) =>
        hash(`${roundSeed}:fallback:${left.name}`) -
        hash(`${roundSeed}:fallback:${right.name}`),
    )
    .map((entry) => entry.name)
    .filter((name) => {
      const normalized = name.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

  const distractors = [...related, ...fallback].slice(0, 5);
  if (distractors.length < 5) return [];

  return [...distractors, actualJournal]
    .map((name) => ({
      name,
      prestigeTier: approximatePrestige(name, knownJournals),
    }))
    .sort(
      (left, right) =>
        left.prestigeTier - right.prestigeTier ||
        hash(`${roundSeed}:keyword-order:${left.name}`) -
          hash(`${roundSeed}:keyword-order:${right.name}`),
    )
    .map(({ name }) => ({ name }));
}
