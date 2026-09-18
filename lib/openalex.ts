type OpenAlexTopic = {
  id: string;
  display_name: string;
  works_count: number;
  subfield?: { id: string; display_name: string };
};

export type OpenAlexWork = {
  id: string;
  doi: string | null;
  title: string | null;
  publication_year: number | null;
  cited_by_count: number | null;
  type: string | null;
  abstract_inverted_index: Record<string, number[]> | null;
  primary_location: {
    source: {
      id: string;
      display_name: string;
      type?: string;
    } | null;
  } | null;
  topics?: Array<{
    id: string;
    display_name: string;
    subfield?: { id: string; display_name: string };
  }>;
  primary_topic?: {
    id: string;
    display_name: string;
    subfield?: { id: string; display_name: string };
  } | null;
};

type ApiList<T> = { results?: T[] };

const API = "https://api.openalex.org";
const topicCache = new Map<string, OpenAlexTopic>();

async function openAlexFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "TestYourTaste/0.1 (scholarly game MVP)",
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`OpenAlex returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function topicScore(topic: OpenAlexTopic, term: string) {
  const label = topic.display_name.toLowerCase();
  const query = term.toLowerCase();
  const exact = label === query ? 1_000_000_000 : 0;
  const contains = label.includes(query) || query.includes(label) ? 100_000_000 : 0;
  return exact + contains + Math.min(topic.works_count ?? 0, 10_000_000);
}

export async function resolveTopic(
  searchTerms: string[],
  signal?: AbortSignal,
) {
  const chosenTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const cached = topicCache.get(chosenTerm);
  if (cached) return cached;

  const params = new URLSearchParams({
    search: chosenTerm,
    "per-page": "8",
    select: "id,display_name,works_count,subfield",
  });
  const payload = await openAlexFetch<ApiList<OpenAlexTopic>>(
    `/topics?${params}`,
    signal,
  );
  const topic = [...(payload.results ?? [])].sort(
    (left, right) => topicScore(right, chosenTerm) - topicScore(left, chosenTerm),
  )[0];
  if (!topic) throw new Error("No matching OpenAlex topic");
  topicCache.set(chosenTerm, topic);
  return topic;
}

export function reconstructAbstract(index: Record<string, number[]> | null) {
  if (!index) return "";
  const words: Array<[number, string]> = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words.push([position, word]);
  }
  return words
    .sort((left, right) => left[0] - right[0])
    .map(([, word]) => word)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function sampleWorks(
  topic: OpenAlexTopic,
  citationFilter: string,
  cutoffYear: number,
  seed: number,
  signal?: AbortSignal,
) {
  const filter = [
    `topics.id:${topic.id.split("/").pop()}`,
    "has_abstract:true",
    "type:article|review",
    "from_publication_date:1990-01-01",
    `to_publication_date:${cutoffYear}-12-31`,
    `cited_by_count:${citationFilter}`,
  ].join(",");
  const params = new URLSearchParams({
    filter,
    sample: "25",
    "per-page": "25",
    seed: String(seed),
    select:
      "id,doi,title,publication_year,cited_by_count,type,abstract_inverted_index,primary_location,topics,primary_topic",
  });
  const payload = await openAlexFetch<ApiList<OpenAlexWork>>(
    `/works?${params}`,
    signal,
  );
  return payload.results ?? [];
}
