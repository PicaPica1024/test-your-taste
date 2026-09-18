import { approximatePrestige } from "@/config/journalPrestige";
import { journalPools } from "@/config/journalPools";

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
