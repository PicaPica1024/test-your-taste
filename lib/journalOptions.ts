import { allVenueNamesForTier, venueNamesForTier } from "@/config/venueTiers";
import { disciplines } from "@/config/disciplines";
import { venueTiers, type VenueTierId } from "@/lib/types";

const otherVenueFallbacks = [
  "PLOS ONE",
  "PeerJ",
  "Heliyon",
  "F1000Research",
  "SAGE Open",
] as const;

const keywordPoolHints: Record<string, string[]> = {
  ecology: ["ecology", "ecological", "biodiversity", "conservation", "ecosystem", "生态", "多样性", "保护生物"],
  aquatic: ["aquatic", "marine", "freshwater", "limnology", "fishery", "ocean", "湖泊", "海洋", "淡水", "水生", "渔业"],
  environment: ["environment", "climate", "pollution", "sustainability", "环境", "气候", "污染", "可持续"],
  organismal: ["plant", "animal", "zoology", "botany", "entomology", "ornithology", "植物", "动物", "昆虫", "鸟类"],
  molecular: ["molecular", "genetic", "genomic", "microbiology", "biotechnology", "protein", "分子", "遗传", "基因", "微生物", "蛋白"],
  neuroscience: ["neuro", "brain", "cognitive", "神经", "大脑", "认知"],
  "general-medicine": ["medicine", "medical", "internal medicine", "医学", "内科"],
  "public-health": ["public health", "epidemiology", "infectious", "公共卫生", "流行病", "传染"],
  biomedicine: ["cancer", "immunology", "pharmacology", "endocrine", "肿瘤", "免疫", "药理", "内分泌"],
  clinical: ["clinical", "cardiology", "neurology", "psychiatry", "临床", "心血管", "精神病"],
  physics: ["physics", "quantum", "物理", "量子"],
  astronomy: ["astronomy", "astrophysics", "galaxy", "planet", "天文", "星系", "行星"],
  chemistry: ["chemistry", "chemical", "catalysis", "化学", "催化"],
  "earth-materials": ["geology", "geophysics", "materials", "atmosphere", "地质", "地球", "材料", "大气"],
  "computer-science": ["computer", "machine learning", "artificial intelligence", "robot", "algorithm", "计算机", "机器学习", "人工智能", "机器人", "算法"],
  engineering: ["engineering", "mechanical", "electrical", "工程", "机械", "电气"],
  "social-science": ["psychology", "sociology", "political", "social", "心理", "社会", "政治"],
  "economics-business": ["economics", "finance", "business", "management", "经济", "金融", "商业", "管理"],
  "education-communication": ["education", "learning", "communication", "media", "教育", "学习", "传播", "媒体"],
};

function normalize(name: string) {
  return name.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function randomIndex(length: number) {
  if (length < 1) throw new Error("Cannot choose from an empty list");
  const values = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / length) * length;
  do crypto.getRandomValues(values);
  while (values[0] >= limit);
  return values[0] % length;
}

function pickRandom(names: string[], used: Set<string>) {
  const available = names.filter((name) => !used.has(normalize(name)));
  if (!available.length) throw new Error("Not enough distinct journal options");
  return available[randomIndex(available.length)];
}

function shuffle<T>(values: T[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = randomIndex(index + 1);
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }
  return result;
}

function candidatesForTier(poolKey: string | undefined, tier: VenueTierId) {
  const local = poolKey ? venueNamesForTier(poolKey, tier) : [];
  if (local.length) return local;
  const global = allVenueNamesForTier(tier);
  if (global.length) return global;
  if (tier === "other") return [...otherVenueFallbacks];
  return [];
}

export function buildJournalOptions(
  actualJournal: string,
  actualTier: VenueTierId,
  poolKey?: string,
) {
  const used = new Set([normalize(actualJournal)]);
  const options = venueTiers.map(({ id }) => {
    if (id === actualTier) return actualJournal;
    const selected = pickRandom(candidatesForTier(poolKey, id), used);
    used.add(normalize(selected));
    return selected;
  });
  return shuffle(options);
}

export function sameJournal(left: string, right: string) {
  return normalize(left) === normalize(right);
}

export function inferPoolKey(keyword: string) {
  const query = normalize(keyword).replace(/-/g, " ");
  const exact = disciplines.find((discipline) =>
    normalize(discipline.name) === query || normalize(discipline.slug).replace(/-/g, " ") === query,
  );
  if (exact) return exact.poolKey;
  return Object.entries(keywordPoolHints).find(([, hints]) =>
    hints.some((hint) => query.includes(normalize(hint))),
  )?.[0];
}
