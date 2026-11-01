import { journalPools } from "./journalPools";
import type { VenueTierId } from "@/lib/types";

function normalizeVenue(name: string) {
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const coreFlagships = [
  "Nature",
  "Science",
  "Cell",
  "Nature Communications",
  "Science Advances",
  "Nature Medicine",
  "Nature Genetics",
  "Nature Biotechnology",
  "Nature Methods",
  "Nature Neuroscience",
  "Nature Immunology",
  "Nature Cell Biology",
  "Nature Ecology & Evolution",
  "Nature Climate Change",
  "Nature Physics",
  "Nature Chemistry",
  "Nature Materials",
  "Nature Machine Intelligence",
  "Nature Plants",
  "Nature Human Behaviour",
  "Science Translational Medicine",
  "Science Robotics",
  "Science Immunology",
  "Cancer Cell",
  "Cell Metabolism",
  "Cell Stem Cell",
  "Molecular Cell",
  "Neuron",
  "Immunity",
  "Cell Host & Microbe",
] as const;

const medicalFlagships = [
  "The New England Journal of Medicine",
  "New England Journal of Medicine",
  "The Lancet",
  "JAMA",
  "The BMJ",
  "BMJ",
] as const;

export const topComputerConferenceNames = [
  "Advances in Neural Information Processing Systems",
  "Neural Information Processing Systems",
  "International Conference on Machine Learning",
  "International Conference on Learning Representations",
  "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
  "Computer Vision and Pattern Recognition",
  "International Conference on Computer Vision",
  "European Conference on Computer Vision",
  "Annual Meeting of the Association for Computational Linguistics",
  "Conference on Empirical Methods in Natural Language Processing",
  "AAAI Conference on Artificial Intelligence",
  "International Joint Conference on Artificial Intelligence",
  "ACM SIGCOMM Conference",
  "ACM Symposium on Operating Systems Principles",
  "USENIX Symposium on Operating Systems Design and Implementation",
  "USENIX Symposium on Networked Systems Design and Implementation",
  "IEEE Symposium on Security and Privacy",
  "ACM Conference on Computer and Communications Security",
  "ACM SIGKDD International Conference on Knowledge Discovery and Data Mining",
  "ACM SIGMOD International Conference on Management of Data",
  "International Conference on Very Large Data Bases",
  "ACM Symposium on Theory of Computing",
  "IEEE Symposium on Foundations of Computer Science",
  "ACM SIGGRAPH Conference",
] as const;

const medicalPoolKeys = new Set([
  "general-medicine",
  "public-health",
  "biomedicine",
  "clinical",
]);

const flagshipByPool: Record<string, readonly string[]> = {
  ecology: [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Ecology & Evolution",
    "Nature Climate Change",
  ],
  aquatic: [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Climate Change",
  ],
  environment: [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Climate Change",
  ],
  organismal: [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Plants",
    "Nature Ecology & Evolution",
  ],
  molecular: [
    "Nature",
    "Science",
    "Cell",
    "Nature Communications",
    "Science Advances",
    "Nature Genetics",
    "Nature Biotechnology",
    "Nature Methods",
    "Nature Cell Biology",
    "Molecular Cell",
    "Cell Metabolism",
    "Cell Stem Cell",
    "Cell Host & Microbe",
  ],
  neuroscience: [
    "Nature",
    "Science",
    "Cell",
    "Nature Communications",
    "Science Advances",
    "Nature Neuroscience",
    "Neuron",
  ],
  physics: [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Physics",
  ],
  astronomy: [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
  ],
  chemistry: [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Chemistry",
  ],
  "earth-materials": [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Materials",
    "Nature Climate Change",
  ],
  "computer-science": [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Machine Intelligence",
  ],
  engineering: [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Materials",
    "Science Robotics",
  ],
  "social-science": [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Human Behaviour",
  ],
  "economics-business": [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Human Behaviour",
  ],
  "education-communication": [
    "Nature",
    "Science",
    "Nature Communications",
    "Science Advances",
    "Nature Human Behaviour",
  ],
};

const coreFlagshipSet = new Set(coreFlagships.map(normalizeVenue));
const medicalFlagshipSet = new Set(medicalFlagships.map(normalizeVenue));
const computerConferenceSet = new Set(
  topComputerConferenceNames.map(normalizeVenue),
);

const quartileOverrides = new Map<string, VenueTierId>([
  [normalizeVenue("Scientific Reports"), "q1"],
  [normalizeVenue("Cell Reports"), "q1"],
]);

export function isFlagshipVenue(
  name: string,
  poolKey: string,
  sourceType?: string,
) {
  const normalized = normalizeVenue(name);
  if (coreFlagshipSet.has(normalized)) return true;
  if (medicalPoolKeys.has(poolKey) && medicalFlagshipSet.has(normalized)) {
    return true;
  }
  return (
    poolKey === "computer-science" &&
    sourceType === "conference" &&
    computerConferenceSet.has(normalized)
  );
}

export function classifyVenue(
  name: string,
  poolKey: string,
  sourceType?: string,
): VenueTierId {
  if (isFlagshipVenue(name, poolKey, sourceType)) return "flagship";
  const override = quartileOverrides.get(normalizeVenue(name));
  if (override) return override;

  const pool = journalPools[poolKey] ?? [];
  const exact = pool.find(
    (entry) => normalizeVenue(entry.name) === normalizeVenue(name),
  );
  if (!exact) return "other";
  if (exact.prestigeTier === 1) return "field-top";
  if (exact.prestigeTier === 2) return "q1";
  if (exact.prestigeTier === 3) return "q2";
  return "other";
}

const tierRank: Record<VenueTierId, number> = {
  flagship: 0,
  "field-top": 1,
  q1: 2,
  q2: 3,
  other: 4,
};

export function classifyVenueAcrossPools(name: string, sourceType?: string) {
  return Object.keys(journalPools)
    .map((poolKey) => classifyVenue(name, poolKey, sourceType))
    .sort((left, right) => tierRank[left] - tierRank[right])[0] ?? "other";
}

export function venueNamesForTier(
  poolKey: string,
  tier: VenueTierId,
): string[] {
  if (tier === "flagship") {
    return [...new Set([
      ...(flagshipByPool[poolKey] ?? coreFlagships),
      ...(medicalPoolKeys.has(poolKey) ? medicalFlagships : []),
      ...(poolKey === "computer-science" ? topComputerConferenceNames : []),
    ])];
  }

  const prestigeTier =
    tier === "field-top" ? 1 : tier === "q1" ? 2 : tier === "q2" ? 3 : 4;
  const names = (journalPools[poolKey] ?? [])
    .filter(
      (entry) =>
        entry.prestigeTier === prestigeTier &&
        !isFlagshipVenue(entry.name, poolKey, "journal"),
    )
    .map((entry) => entry.name);

  if (tier === "q1") {
    names.push("Scientific Reports", "Cell Reports");
  }
  return [...new Set(names)];
}

export function allVenueNamesForTier(tier: VenueTierId) {
  const names = Object.keys(journalPools).flatMap((poolKey) =>
    venueNamesForTier(poolKey, tier),
  );
  return [...new Set(names)];
}

export function classificationNote(tier: VenueTierId) {
  if (tier === "flagship") {
    return "依据项目维护的综合顶刊、旗舰子刊、医学综合顶刊与计算机顶会白名单。";
  }
  if (tier === "field-top") {
    return "依据学术声誉、领域认可、选择性与发表规模等因素综合维护的领域顶级来源名单，不以单一影响因子决定。";
  }
  if (tier === "q1") {
    return "依据项目维护的普通 JCR Q1 映射；旗舰刊和领域顶刊优先归入更高档。";
  }
  if (tier === "q2") {
    return "依据项目维护的 JCR Q2 映射。";
  }
  return "该来源未进入前四档，归入其他（Q3、Q4 或未分类来源）。";
}
