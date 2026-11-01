export const citationRanges = [
  { id: "0-25", label: "0–25", min: 0, max: 25 },
  { id: "26-100", label: "26–100", min: 26, max: 100 },
  { id: "101-300", label: "101–300", min: 101, max: 300 },
  { id: "301-1000", label: "301–1000", min: 301, max: 1000 },
  { id: "1001+", label: ">1000", min: 1001, max: Number.POSITIVE_INFINITY },
] as const;

export const venueTiers = [
  {
    id: "flagship",
    label: "综合顶刊 / 旗舰子刊",
    description: "Nature、Science、Cell 体系的指定旗舰刊，以及医学综合顶刊和计算机顶会",
  },
  {
    id: "field-top",
    label: "领域顶刊",
    description: "该学科公认的顶级专业期刊",
  },
  {
    id: "q1",
    label: "普通 JCR 一区",
    description: "不属于前两档的一区期刊",
  },
  {
    id: "q2",
    label: "JCR 二区",
    description: "二区期刊",
  },
  {
    id: "other",
    label: "其他",
    description: "Q3、Q4 或未列入以上档次的同行评议来源",
  },
] as const;

export const careerStages = [
  { id: "masters", label: "硕士生" },
  { id: "phd", label: "博士生" },
  { id: "post-phd-0-5", label: "博士毕业 5 年内" },
  { id: "post-phd-5-plus", label: "博士毕业 5 年后" },
  { id: "other", label: "其他 / 暂不填写" },
] as const;

export type CitationRangeId = (typeof citationRanges)[number]["id"];
export type VenueTierId = (typeof venueTiers)[number]["id"];
export type CareerStageId = (typeof careerStages)[number]["id"];
export type PlayerType = "human" | "ai";

export type PaperPrompt = {
  id: string;
  year: number;
  title: string;
  abstract: string;
};

export type GeneratedRound = {
  paper: PaperPrompt;
  answer: {
    journal: string;
    venueTier: VenueTierId;
    citations: number;
    citationRange: CitationRangeId;
    retrievedAt: string;
    viewUrl: string;
    source: "OpenAlex";
    classificationNote: string;
  };
};

export type Round = {
  roundId: string;
  paper: PaperPrompt;
  requestedTier: VenueTierId;
};

export type RoundResult = {
  score: number;
  venueCorrect: boolean;
  citationCorrect: boolean;
  actualJournal: string;
  actualVenueTier: VenueTierId;
  actualCitations: number;
  actualCitationRange: CitationRangeId;
  retrievedAt: string;
  viewUrl: string;
  classificationNote: string;
};

export type SessionStats = {
  points: number;
  papersPlayed: number;
  venueCorrect: number;
  citationCorrect: number;
  streak: number;
};

export type BenchmarkSummary = {
  playerType: PlayerType;
  answers: number;
  venueCorrect: number;
  citationCorrect: number;
};
