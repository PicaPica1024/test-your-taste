import type { JournalMeta } from "./journalPools";

const elitePatterns = [
  /^nature($|\s)/i,
  /^science$/i,
  /new england journal of medicine/i,
  /^the lancet($|\s)/i,
  /cell$/i,
  /physical review letters/i,
];

export function approximatePrestige(
  journal: string,
  pool: JournalMeta[],
): JournalMeta["prestigeTier"] {
  const exact = pool.find(
    (entry) => entry.name.toLowerCase() === journal.toLowerCase(),
  );
  if (exact) return exact.prestigeTier;
  return elitePatterns.some((pattern) => pattern.test(journal)) ? 1 : 3;
}
