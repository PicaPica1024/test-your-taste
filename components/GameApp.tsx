"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { disciplines } from "@/config/disciplines";
import {
  careerStages,
  citationRanges,
  venueTiers,
  type BenchmarkSummary,
  type CareerStageId,
  type CitationRangeId,
  type PlayerType,
  type Round,
  type RoundResult,
  type SessionStats,
  type VenueTierId,
} from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { CitationQuiz } from "./CitationQuiz";
import { DisciplineSelector, type ResearchSelection } from "./DisciplineSelector";
import { FamiliarityCheck } from "./FamiliarityCheck";
import { PaperCard } from "./PaperCard";
import { Results } from "./Results";
import { ScoreBar } from "./ScoreBar";
import { VenueTierQuiz } from "./VenueTierQuiz";

const STORAGE_KEY = "test-your-taste:session:v2";
const emptyStats: SessionStats = { points: 0, papersPlayed: 0, venueCorrect: 0, citationCorrect: 0, streak: 0 };
type Screen = "select" | "loading" | "playing" | "error";
type Phase = "familiarity" | "quiz" | "revealed";

function shuffledTiers(): VenueTierId[] {
  const items = venueTiers.map((tier) => tier.id);
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapWith]] = [items[swapWith], items[index]];
  }
  return items;
}

function publicPrompt(round: Round) {
  return { roundId: round.roundId, paper: round.paper };
}

export function GameApp() {
  const [screen, setScreen] = useState<Screen>("select");
  const [researchSelection, setResearchSelection] = useState<ResearchSelection | null>(null);
  const [careerStage, setCareerStage] = useState<CareerStageId>("prefer-not-say");
  const [participantId, setParticipantId] = useState("");
  const [tierQueue, setTierQueue] = useState<VenueTierId[]>(() => venueTiers.map((tier) => tier.id));
  const [round, setRound] = useState<Round | null>(null);
  const [phase, setPhase] = useState<Phase>("familiarity");
  const [venueGuess, setVenueGuess] = useState<VenueTierId | null>(null);
  const [citationGuess, setCitationGuess] = useState<CitationRangeId | null>(null);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [stats, setStats] = useState<SessionStats>(emptyStats);
  const [benchmark, setBenchmark] = useState<BenchmarkSummary[]>([]);
  const [shownIds, setShownIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keepSelectorVisible, setKeepSelectorVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const roundRef = useRef<Round | null>(null);
  const phaseRef = useRef<Phase>("familiarity");
  const selectionRef = useRef<ResearchSelection | null>(null);
  const careerStageRef = useRef<CareerStageId>("prefer-not-say");
  const participantRef = useRef("");
  const tierQueueRef = useRef<VenueTierId[]>(venueTiers.map((tier) => tier.id));
  const shownIdsRef = useRef<string[]>([]);

  useEffect(() => {
    roundRef.current = round;
    phaseRef.current = phase;
    selectionRef.current = researchSelection;
    careerStageRef.current = careerStage;
    participantRef.current = participantId;
    tierQueueRef.current = tierQueue;
    shownIdsRef.current = shownIds;
  }, [round, phase, researchSelection, careerStage, participantId, tierQueue, shownIds]);

  /* eslint-disable react-hooks/set-state-in-effect -- browser storage is restored after hydration */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as {
        selection?: { kind?: string; slug?: string; keyword?: string };
        careerStage?: CareerStageId;
        participantId?: string;
        tierQueue?: VenueTierId[];
        stats?: SessionStats;
        shownIds?: string[];
      } | null;
      if (saved?.selection?.kind === "keyword" && saved.selection.keyword) {
        const keyword = saved.selection.keyword.trim().replace(/\s+/g, " ");
        if (keyword.length >= 2 && keyword.length <= 120) {
          setResearchSelection({ kind: "keyword", label: keyword, keyword });
        }
      } else {
        const restored = disciplines.find((item) => item.slug === saved?.selection?.slug);
        if (restored) setResearchSelection({ kind: "discipline", label: restored.name, discipline: restored });
      }
      if (saved?.stats) setStats(saved.stats);
      if (Array.isArray(saved?.shownIds)) setShownIds(saved.shownIds.slice(-100));
      if (careerStages.some((stage) => stage.id === saved?.careerStage)) setCareerStage(saved!.careerStage!);
      const validQueue = saved?.tierQueue?.filter((id) => venueTiers.some((tier) => tier.id === id));
      setTierQueue(validQueue?.length ? validQueue : shuffledTiers());
      setParticipantId(saved?.participantId && /^[a-zA-Z0-9-]{8,80}$/.test(saved.participantId)
        ? saved.participantId
        : crypto.randomUUID());
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setTierQueue(shuffledTiers());
      setParticipantId(crypto.randomUUID());
    } finally {
      setHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    const selection = researchSelection
      ? researchSelection.kind === "discipline"
        ? { kind: "discipline", slug: researchSelection.discipline.slug }
        : { kind: "keyword", keyword: researchSelection.keyword }
      : undefined;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selection,
      careerStage,
      participantId,
      tierQueue,
      stats,
      shownIds,
    }));
  }, [researchSelection, careerStage, participantId, tierQueue, stats, shownIds, hydrated]);

  function resetDeck() {
    const deck = shuffledTiers();
    tierQueueRef.current = deck;
    setTierQueue(deck);
    return deck;
  }

  function consumeTier() {
    const remaining = tierQueueRef.current.slice(1);
    const next = remaining.length ? remaining : shuffledTiers();
    tierQueueRef.current = next;
    setTierQueue(next);
  }

  function currentParticipantId() {
    if (participantRef.current) return participantRef.current;
    const id = crypto.randomUUID();
    participantRef.current = id;
    setParticipantId(id);
    return id;
  }

  async function loadPaper(
    target = selectionRef.current,
    options?: { keepSelectorVisible?: boolean; tier?: VenueTierId },
  ) {
    if (!target) throw new Error("Choose a topic first");
    let tier = options?.tier ?? tierQueueRef.current[0];
    if (!tier) tier = resetDeck()[0];
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setKeepSelectorVisible(Boolean(options?.keepSelectorVisible));
    setScreen("loading");
    setRound(null);
    roundRef.current = null;
    setPhase("familiarity");
    phaseRef.current = "familiarity";
    setVenueGuess(null);
    setCitationGuess(null);
    setResult(null);
    setErrorMessage(null);
    setBenchmark([]);
    try {
      const response = await fetch("/api/paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(target.kind === "discipline"
            ? { discipline: target.discipline.slug }
            : { keyword: target.keyword }),
          requestedTier: tier,
          excludedIds: shownIdsRef.current,
        }),
        signal: controller.signal,
      });
      const payload = (await response.json()) as Round | { error?: string };
      if (!response.ok || !("paper" in payload)) {
        throw new Error("error" in payload && payload.error ? payload.error : "The paper request failed.");
      }
      setRound(payload);
      roundRef.current = payload;
      const nextShown = [...shownIdsRef.current, payload.paper.id].slice(-100);
      shownIdsRef.current = nextShown;
      setShownIds(nextShown);
      setKeepSelectorVisible(false);
      setScreen("playing");
      return payload;
    } catch (error) {
      if ((error as Error).name === "AbortError") throw error;
      const message = error instanceof Error ? error.message : "The paper request failed.";
      setErrorMessage(message);
      setKeepSelectorVisible(false);
      setScreen("error");
      throw error;
    }
  }

  async function beginGame(target: ResearchSelection, keepSelectorVisible = true) {
    selectionRef.current = target;
    setResearchSelection(target);
    const deck = resetDeck();
    return loadPaper(target, { keepSelectorVisible, tier: deck[0] });
  }

  async function skipAndReplace(reason: "read" | "unsure", playerType: PlayerType = "human") {
    const currentRound = roundRef.current;
    const target = selectionRef.current;
    if (!currentRound || !target) throw new Error("There is no paper to skip");
    setBusy(true);
    try {
      const response = await fetch("/api/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: currentRound.roundId,
          participantId: currentParticipantId(),
          playerType,
          careerStage: careerStageRef.current,
          familiarity: reason,
        }),
      });
      if (!response.ok) throw new Error("Could not record the skipped paper");
      return await loadPaper(target, { tier: currentRound.requestedTier });
    } finally {
      setBusy(false);
    }
  }

  async function fetchBenchmark(target: ResearchSelection | null) {
    if (target?.kind !== "discipline") return [];
    const response = await fetch(`/api/stats?discipline=${encodeURIComponent(target.discipline.slug)}`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { summaries?: BenchmarkSummary[] };
    const summaries = payload.summaries ?? [];
    setBenchmark(summaries);
    return summaries;
  }

  async function submitGuesses(venue: VenueTierId, citation: CitationRangeId, playerType: PlayerType = "human") {
    const currentRound = roundRef.current;
    if (!currentRound || phaseRef.current !== "quiz") throw new Error("There is no unanswered paper");
    setBusy(true);
    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: currentRound.roundId,
          participantId: currentParticipantId(),
          playerType,
          careerStage: careerStageRef.current,
          venueTier: venue,
          citationRange: citation,
        }),
      });
      const payload = (await response.json()) as RoundResult | { error?: string };
      if (!response.ok || !("actualJournal" in payload)) {
        throw new Error("error" in payload && payload.error ? payload.error : "Could not submit the answer");
      }
      setVenueGuess(venue);
      setCitationGuess(citation);
      setResult(payload);
      setPhase("revealed");
      phaseRef.current = "revealed";
      setStats((current) => ({
        points: current.points + payload.score,
        papersPlayed: current.papersPlayed + 1,
        venueCorrect: current.venueCorrect + Number(payload.venueCorrect),
        citationCorrect: current.citationCorrect + Number(payload.citationCorrect),
        streak: payload.venueCorrect && payload.citationCorrect ? current.streak + 1 : 0,
      }));
      consumeTier();
      await fetchBenchmark(selectionRef.current);
      return payload;
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const registration = Promise.all([
      Promise.resolve(context.registerTool({
        name: "start_research_taste_game",
        title: "开始科研品味游戏",
        description: "按预设学科或自定义关键词开始一轮。只返回年份、标题和摘要，不返回答案。",
        inputSchema: {
          type: "object",
          properties: {
            disciplineSlug: { type: "string", description: "预设学科 slug。" },
            keyword: { type: "string", minLength: 2, maxLength: 120, description: "OpenAlex 检索关键词。" },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        async execute(input) {
          const values = typeof input === "object" && input ? input as { disciplineSlug?: unknown; keyword?: unknown } : {};
          const keyword = typeof values.keyword === "string" ? values.keyword.trim().replace(/\s+/g, " ") : "";
          let target: ResearchSelection;
          if (keyword) {
            if (keyword.length < 2 || keyword.length > 120) throw new Error("Keyword must be 2–120 characters");
            const exactDiscipline = disciplines.find((item) =>
              item.name.toLowerCase() === keyword.toLowerCase() || item.slug === keyword.toLowerCase(),
            );
            target = exactDiscipline
              ? { kind: "discipline", label: exactDiscipline.name, discipline: exactDiscipline }
              : { kind: "keyword", label: keyword, keyword };
          } else {
            const discipline = disciplines.find((item) => item.slug === values.disciplineSlug);
            if (!discipline) throw new Error("Provide a valid discipline slug or keyword");
            target = { kind: "discipline", label: discipline.name, discipline };
          }
          const loaded = await beginGame(target, false);
          return { status: "familiarity_required", researchQuery: target.label, ...publicPrompt(loaded) };
        },
      }, { signal: lifecycle.signal })),
      Promise.resolve(context.registerTool({
        name: "confirm_paper_familiarity",
        title: "确认是否读过论文",
        description: "确认用户没读过后开放选项；若读过或不确定，则换一篇同档次论文且不计分。",
        inputSchema: {
          type: "object",
          properties: { familiarity: { type: "string", enum: ["new", "read", "unsure"] } },
          required: ["familiarity"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input) {
          const familiarity = (input as { familiarity?: unknown })?.familiarity;
          if (familiarity === "read" || familiarity === "unsure") {
            const replacement = await skipAndReplace(familiarity);
            return { status: "familiarity_required", ...publicPrompt(replacement) };
          }
          if (familiarity !== "new" || !roundRef.current) throw new Error("Familiarity must be new, read, or unsure");
          setPhase("quiz");
          phaseRef.current = "quiz";
          return {
            status: "ready_for_guess",
            venueOptions: venueTiers.map((item) => ({ id: item.id, label: item.label, description: item.description })),
            citationOptions: citationRanges.map((item) => ({ id: item.id, label: item.label })),
          };
        },
      }, { signal: lifecycle.signal })),
      Promise.resolve(context.registerTool({
        name: "submit_taste_guess",
        title: "提交科研品味判断",
        description: "提交发表档次与引用量区间，随后由服务器公布答案。普通互动游戏使用 human；仅在 AI 自己闭卷作答时使用 ai。",
        inputSchema: {
          type: "object",
          properties: {
            venueTier: { type: "string", enum: venueTiers.map((tier) => tier.id) },
            citationRange: { type: "string", enum: citationRanges.map((range) => range.id) },
            playerType: { type: "string", enum: ["human", "ai"] },
          },
          required: ["venueTier", "citationRange"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input) {
          const guess = input as { venueTier?: unknown; citationRange?: unknown; playerType?: unknown };
          const venue = venueTiers.find((item) => item.id === guess.venueTier)?.id;
          const citation = citationRanges.find((item) => item.id === guess.citationRange)?.id;
          if (!venue || !citation) throw new Error("Both guesses must use visible option ids");
          const playerType: PlayerType = guess.playerType === "ai" ? "ai" : "human";
          return submitGuesses(venue, citation, playerType);
        },
      }, { signal: lifecycle.signal })),
    ]).catch((error) => {
      if (!lifecycle.signal.aborted) console.warn("WebMCP registration failed", error);
    });
    void registration;
    return () => lifecycle.abort();
  // WebMCP tools are registered once; mutable game state is intentionally read from refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeField() {
    abortRef.current?.abort();
    setScreen("select");
    setRound(null);
    roundRef.current = null;
    setPhase("familiarity");
    setKeepSelectorVisible(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (screen === "select" || (screen === "loading" && keepSelectorVisible)) {
    return (
      <DisciplineSelector
        key={researchSelection?.label ?? "new-selection"}
        value={researchSelection}
        onChange={(selection) => {
          selectionRef.current = selection;
          setResearchSelection(selection);
        }}
        onStart={(target) => void beginGame(target, true).catch(() => undefined)}
        careerStage={careerStage}
        onCareerStageChange={(stage) => {
          careerStageRef.current = stage;
          setCareerStage(stage);
        }}
        loading={screen === "loading"}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <button onClick={changeField} className="flex items-center gap-3 text-left" aria-label="返回主题选择">
            <span className="grid size-8 place-items-center border border-ink/25 font-serif">T²</span>
            <span className="font-serif text-lg font-semibold text-ink">Test Your Taste</span>
          </button>
          <button onClick={changeField} className="max-w-[48vw] truncate text-sm font-semibold text-accent-strong hover:underline">{researchSelection?.label}</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1160px] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
        <ScoreBar stats={stats} />
        <p className="mt-3 text-right text-xs text-ink-muted">随机五轮一组 · 五个档次各一次</p>
        {screen === "loading" && <LoadingPaper />}
        {screen === "error" && (
          <section className="mx-auto grid min-h-[55vh] max-w-xl place-items-center text-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-accent-strong">检索暂时停住了</p>
              <h1 className="font-serif text-4xl text-ink">没有找到符合本轮档次的论文</h1>
              <p className="mt-4 text-base leading-7 text-ink-muted">{errorMessage ?? "数据源可能正忙，请重试。"} 本轮不计分。</p>
              <div className="mt-7 flex justify-center gap-3">
                <Button variant="outline" className="rounded-none" onClick={changeField}>更换主题</Button>
                <Button className="rounded-none bg-accent-strong text-white hover:bg-ink" onClick={() => void loadPaper().catch(() => undefined)}>重试</Button>
              </div>
            </div>
          </section>
        )}
        {screen === "playing" && round && (
          <div className="mx-auto mt-10 max-w-[900px]">
            <PaperCard {...round.paper} />
            {phase === "familiarity" && (
              <FamiliarityCheck
                busy={busy}
                onNew={() => {
                  phaseRef.current = "quiz";
                  setPhase("quiz");
                }}
                onSkip={(reason) => void skipAndReplace(reason).catch(() => undefined)}
              />
            )}
            {(phase === "quiz" || phase === "revealed") && (
              <>
                <VenueTierQuiz value={venueGuess} onChange={setVenueGuess} revealed={phase === "revealed"} actual={result?.actualVenueTier} />
                <CitationQuiz value={citationGuess} onChange={setCitationGuess} revealed={phase === "revealed"} actual={result?.actualCitationRange} />
              </>
            )}
            {phase === "quiz" && (
              <div className="mb-12 flex justify-end border-t border-ink/15 pt-7">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-none bg-ink px-10 text-base text-paper hover:bg-accent-strong sm:w-auto"
                  disabled={!venueGuess || !citationGuess || busy}
                  onClick={() => venueGuess && citationGuess && void submitGuesses(venueGuess, citationGuess).catch((error) => setErrorMessage(error instanceof Error ? error.message : "提交失败，请重试"))}
                >
                  {busy ? "正在提交…" : "公布答案"}
                </Button>
              </div>
            )}
            {phase === "quiz" && errorMessage && <p className="-mt-8 mb-10 text-right text-sm text-wrong-strong">{errorMessage}</p>}
            {phase === "revealed" && result && venueGuess && citationGuess && (
              <Results
                result={result}
                venueGuess={venueGuess}
                citationGuess={citationGuess}
                benchmark={benchmark}
                onNext={() => void loadPaper().catch(() => undefined)}
                onChangeField={changeField}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function LoadingPaper() {
  return (
    <section className="mx-auto mt-12 max-w-[900px]" aria-live="polite">
      <p className="mb-8 text-sm font-bold uppercase tracking-[0.16em] text-accent-strong">正在寻找合适的论文…</p>
      <Skeleton className="h-7 w-20 rounded-none bg-ink/10" />
      <div className="mt-7 space-y-4">
        <Skeleton className="h-14 w-full rounded-none bg-ink/10" />
        <Skeleton className="h-14 w-4/5 rounded-none bg-ink/10" />
      </div>
      <div className="mt-12 space-y-3 border-t border-ink/15 pt-8">
        {[100, 96, 92, 98, 82].map((width) => <Skeleton key={width} className="h-4 rounded-none bg-ink/10" style={{ width: `${width}%` }} />)}
      </div>
    </section>
  );
}
