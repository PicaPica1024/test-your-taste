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
  language: string | null;
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

export type OpenAlexErrorCode =
  | "OPENALEX_KEY_MISSING"
  | "OPENALEX_AUTH_FAILED"
  | "OPENALEX_RATE_LIMITED"
  | "OPENALEX_UPSTREAM_ERROR";

export class OpenAlexError extends Error {
  constructor(
    message: string,
    readonly code: OpenAlexErrorCode,
    readonly status?: number,
  ) {
    super(message);
    this.name = "OpenAlexError";
  }
}

function requestUrl(path: string) {
  const url = new URL(path, API);
  const apiKey = process.env.OPENALEX_API_KEY?.trim();

  // OpenAlex only grants a tiny shared allowance to keyless traffic. That is
  // useful for local experiments, but Cloudflare egress exhausts it quickly in
  // production because many applications can share the same public IP.
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  } else if (process.env.NODE_ENV === "production") {
    throw new OpenAlexError(
      "OPENALEX_API_KEY is not configured",
      "OPENALEX_KEY_MISSING",
    );
  }

  return url;
}

function retryDelay(response: Response, attempt: number) {
  const retryAfter = Number(response.headers.get("Retry-After"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1_000, 4_000);
  }
  return 250 * 2 ** attempt;
}

async function pause(milliseconds: number, signal?: AbortSignal) {
  if (signal?.aborted) throw signal.reason;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

async function openAlexFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = requestUrl(path);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TestYourTaste/0.1 (scholarly game MVP)",
      },
      signal,
    });
    if (response.ok) return response.json() as Promise<T>;

    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < 2) {
      await pause(retryDelay(response, attempt), signal);
      continue;
    }

    const code: OpenAlexErrorCode =
      response.status === 401 || response.status === 403 || response.status === 409
        ? "OPENALEX_AUTH_FAILED"
        : response.status === 429
          ? "OPENALEX_RATE_LIMITED"
          : "OPENALEX_UPSTREAM_ERROR";
    throw new OpenAlexError(
      `OpenAlex returned HTTP ${response.status}`,
      code,
      response.status,
    );
  }

  throw new OpenAlexError(
    "OpenAlex request failed after retries",
    "OPENALEX_UPSTREAM_ERROR",
  );
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
    "language:en|zh",
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
      "id,doi,title,language,publication_year,cited_by_count,type,abstract_inverted_index,primary_location,topics,primary_topic",
  });
  const payload = await openAlexFetch<ApiList<OpenAlexWork>>(
    `/works?${params}`,
    signal,
  );
  return payload.results ?? [];
}

export async function searchWorksByKeyword(
  keyword: string,
  citationFilter: string,
  cutoffYear: number,
  seed: number,
  signal?: AbortSignal,
) {
  const filter = [
    "language:en|zh",
    "has_abstract:true",
    "type:article|review",
    "from_publication_date:1990-01-01",
    `to_publication_date:${cutoffYear}-12-31`,
    `cited_by_count:${citationFilter}`,
  ].join(",");
  const params = new URLSearchParams({
    search: keyword,
    filter,
    sample: "50",
    "per-page": "50",
    seed: String(seed),
    select:
      "id,doi,title,language,publication_year,cited_by_count,type,abstract_inverted_index,primary_location,topics,primary_topic",
  });
  const payload = await openAlexFetch<ApiList<OpenAlexWork>>(
    `/works?${params}`,
    signal,
  );
  return payload.results ?? [];
}
