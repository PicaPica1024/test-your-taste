export const citationRanges = [
  { id: "0-25", label: "0–25", min: 0, max: 25 },
  { id: "26-100", label: "26–100", min: 26, max: 100 },
  { id: "101-300", label: "101–300", min: 101, max: 300 },
  { id: "301-1000", label: "301–1000", min: 301, max: 1000 },
  { id: "1001+", label: ">1000", min: 1001, max: Number.POSITIVE_INFINITY },
] as const;

export type CitationRangeId = (typeof citationRanges)[number]["id"];

export type JournalOption = { name: string };

export type Round = {
  paper: {
    id: string;
    year: number;
    title: string;
    abstract: string;
  };
  journalOptions: JournalOption[];
  answer: {
    journal: string;
    citations: number;
    citationRange: CitationRangeId;
    retrievedAt: string;
    viewUrl: string;
    source: "OpenAlex";
  };
};

export type SessionStats = {
  points: number;
  papersPlayed: number;
  journalCorrect: number;
  citationCorrect: number;
  streak: number;
};
