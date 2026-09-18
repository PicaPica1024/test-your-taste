import { citationRanges, type CitationRangeId } from "./types";

export function rangeForCitations(citations: number): CitationRangeId {
  return (
    citationRanges.find(
      (range) => citations >= range.min && citations <= range.max,
    )?.id ?? "1001+"
  );
}

export function percentage(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
