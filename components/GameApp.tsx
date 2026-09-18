"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { disciplines, type Discipline } from "@/config/disciplines";
import { citationRanges, type CitationRangeId, type Round, type SessionStats } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { CitationQuiz } from "./CitationQuiz";
import { DisciplineSelector } from "./DisciplineSelector";
import { JournalQuiz } from "./JournalQuiz";
import { PaperCard } from "./PaperCard";
import { Results } from "./Results";
import { ScoreBar } from "./ScoreBar";

const STORAGE_KEY = "test-your-taste:session:v1";
const emptyStats: SessionStats = { points: 0, papersPlayed: 0, journalCorrect: 0, citationCorrect: 0, streak: 0 };
type Screen = "select" | "loading" | "playing" | "error";

export function GameApp() {
  const [screen, setScreen] = useState<Screen>("select");
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [journalGuess, setJournalGuess] = useState<string | null>(null);
  const [citationGuess, setCitationGuess] = useState<CitationRangeId | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState<SessionStats>(emptyStats);
  const [shownIds, setShownIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const roundRef = useRef<Round | null>(null);
  const revealedRef = useRef(false);
  const shownIdsRef = useRef<string[]>([]);
  roundRef.current = round;
  revealedRef.current = revealed;
  shownIdsRef.current = shownIds;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { discipline?: string; stats?: SessionStats; shownIds?: string[] } | null;
      if (saved?.discipline) setDiscipline(disciplines.find((item) => item.slug === saved.discipline) ?? null);
      if (saved?.stats) setStats(saved.stats);
      if (Array.isArray(saved?.shownIds)) setShownIds(saved.shownIds.slice(-100));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ discipline: discipline?.slug, stats, shownIds }));
  }, [discipline, stats, shownIds, hydrated]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    const registration = Promise.all([
      Promise.resolve(context.registerTool({
        name: "start_research_taste_game",
        title: "Start research taste game",
        description: "Start a Test Your Taste round in one valid research field and update the visible game with a real OpenAlex paper.",
        inputSchema: {
          type: "object",
          properties: { disciplineSlug: { type: "string", description: "A slug from the configured discipline taxonomy." } },
          required: ["disciplineSlug"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        async execute(input) {
          const slug = typeof input === "object" && input ? (input as { disciplineSlug?: unknown }).disciplineSlug : undefined;
          const target = disciplines.find((item) => item.slug === slug);
          if (!target) throw new Error("Unknown discipline slug");
          setDiscipline(target);
          await loadPaper(target);
          return { status: "paper_ready", discipline: target.name };
        },
      }, { signal: lifecycle.signal })),
      Promise.resolve(context.registerTool({
        name: "submit_taste_guess",
        title: "Submit taste guess",
        description: "Submit one journal and citation-range guess for the visible paper, reveal the verified answer, and update the visible session score.",
        inputSchema: {
          type: "object",
          properties: {
            journal: { type: "string" },
            citationRange: { type: "string", enum: citationRanges.map((range) => range.id) },
          },
          required: ["journal", "citationRange"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          const currentRound = roundRef.current;
          if (!currentRound || revealedRef.current) throw new Error("There is no unanswered paper");
          const guess = input as { journal?: unknown; citationRange?: unknown };
          if (typeof guess.journal !== "string" || !currentRound.journalOptions.some((option) => option.name === guess.journal)) {
            throw new Error("Journal must be one of the six visible options");
          }
          const citationRange = citationRanges.find((range) => range.id === guess.citationRange)?.id;
          if (!citationRange) throw new Error("Citation range is invalid");
          setJournalGuess(guess.journal);
          setCitationGuess(citationRange);
          const result = scoreGuesses(guess.journal, citationRange);
          return {
            score: result.score,
            journalCorrect: result.journalCorrect,
            citationCorrect: result.citationCorrect,
            actualJournal: currentRound.answer.journal,
            actualCitations: currentRound.answer.citations,
          };
        },
      }, { signal: lifecycle.signal })),
    ]).catch((error) => {
      if (!lifecycle.signal.aborted) console.warn("WebMCP registration failed", error);
    });

    void registration;
    return () => lifecycle.abort();
  }, []);

  async function loadPaper(target = discipline) {
    if (!target) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setScreen("loading");
    setRound(null);
    setRevealed(false);
    setJournalGuess(null);
    setCitationGuess(null);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discipline: target.slug, excludedIds: shownIdsRef.current }),
        signal: controller.signal,
      });
      const payload = (await response.json()) as Round | { error?: string };
      if (!response.ok || !("paper" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "The paper request failed. Please try again.",
        );
      }
      setRound(payload);
      setShownIds((current) => [...current, payload.paper.id].slice(-100));
      setScreen("playing");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The paper request failed. Please try again.",
        );
        setScreen("error");
      }
    }
  }

  function scoreGuesses(journal: string, citation: CitationRangeId) {
    const currentRound = roundRef.current;
    if (!currentRound) throw new Error("No paper is ready");
    const journalCorrect = journal === currentRound.answer.journal;
    const citationCorrect = citation === currentRound.answer.citationRange;
    setStats((current) => ({
      points: current.points + Number(journalCorrect) + Number(citationCorrect),
      papersPlayed: current.papersPlayed + 1,
      journalCorrect: current.journalCorrect + Number(journalCorrect),
      citationCorrect: current.citationCorrect + Number(citationCorrect),
      streak: journalCorrect && citationCorrect ? current.streak + 1 : 0,
    }));
    setRevealed(true);
    return {
      score: Number(journalCorrect) + Number(citationCorrect),
      journalCorrect,
      citationCorrect,
    };
  }

  function reveal() {
    if (!round || !journalGuess || !citationGuess || revealed) return;
    scoreGuesses(journalGuess, citationGuess);
  }

  function changeField() {
    abortRef.current?.abort();
    setScreen("select");
    setRound(null);
    setRevealed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (screen === "select") {
    return <DisciplineSelector value={discipline} onChange={setDiscipline} onStart={() => loadPaper(discipline)} />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <button onClick={changeField} className="flex items-center gap-3 text-left" aria-label="Return to field selection">
            <span className="grid size-8 place-items-center border border-ink/25 font-serif">T²</span>
            <span className="font-serif text-lg font-semibold text-ink">Test Your Taste</span>
          </button>
          <button onClick={changeField} className="max-w-[48vw] truncate text-sm font-semibold text-accent-strong hover:underline">{discipline?.name}</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1160px] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
        <ScoreBar stats={stats} />
        {screen === "loading" && <LoadingPaper />}
        {screen === "error" && (
          <section className="mx-auto grid min-h-[55vh] max-w-xl place-items-center text-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-accent-strong">Retrieval paused</p>
              <h1 className="font-serif text-4xl text-ink">Couldn&apos;t find a suitable paper.</h1>
              <p className="mt-4 text-base leading-7 text-ink-muted">{errorMessage ?? "The source may be busy, or this field needs another sample."} Nothing was added to your score.</p>
              <div className="mt-7 flex justify-center gap-3">
                <Button variant="outline" className="rounded-none" onClick={changeField}>Change Field</Button>
                <Button className="rounded-none bg-accent-strong text-white hover:bg-ink" onClick={() => loadPaper()}>Try Again</Button>
              </div>
            </div>
          </section>
        )}
        {screen === "playing" && round && (
          <div className="mx-auto mt-10 max-w-[900px]">
            <PaperCard {...round.paper} />
            <JournalQuiz options={round.journalOptions} value={journalGuess} onChange={setJournalGuess} revealed={revealed} actual={revealed ? round.answer.journal : undefined} />
            <CitationQuiz value={citationGuess} onChange={setCitationGuess} revealed={revealed} actual={revealed ? round.answer.citationRange : undefined} />
            {!revealed && (
              <div className="mb-12 flex justify-end border-t border-ink/15 pt-7">
                <Button size="lg" className="h-12 w-full rounded-none bg-ink px-10 text-base text-paper hover:bg-accent-strong sm:w-auto" disabled={!journalGuess || !citationGuess} onClick={reveal}>Reveal</Button>
              </div>
            )}
            {revealed && journalGuess && citationGuess && (
              <Results round={round} journalGuess={journalGuess} citationGuess={citationGuess} onNext={() => loadPaper()} onChangeField={changeField} />
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
      <p className="mb-8 text-sm font-bold uppercase tracking-[0.16em] text-accent-strong">Finding a paper…</p>
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
