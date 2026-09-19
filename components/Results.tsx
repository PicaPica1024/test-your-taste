import { Button } from "@/components/ui/button";
import type { CitationRangeId, Round } from "@/lib/types";
import { ArrowRight, ExternalLink } from "lucide-react";

type Props = {
  round: Round;
  journalGuess: string;
  citationGuess: CitationRangeId;
  onNext: () => void;
  onChangeField: () => void;
};

export function Results({ round, journalGuess, citationGuess, onNext, onChangeField }: Props) {
  const journalCorrect = journalGuess === round.answer.journal;
  const citationCorrect = citationGuess === round.answer.citationRange;
  const roundScore = Number(journalCorrect) + Number(citationCorrect);
  const retrieved = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(round.answer.retrievedAt));

  return (
    <section className="mb-10 border-2 border-ink bg-surface" aria-live="polite">
      <div className="flex items-center justify-between border-b border-ink bg-ink px-5 py-4 text-paper sm:px-7">
        <h2 className="font-serif text-2xl">Verdict</h2>
        <p className="text-sm font-bold uppercase tracking-[0.12em]">{roundScore} / 2 points</p>
      </div>
      <div className="grid gap-px bg-ink/15 sm:grid-cols-2">
        <div className="bg-surface p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">Journal</p>
          <p className={`mt-3 text-sm font-semibold ${journalCorrect ? "text-correct-strong" : "text-wrong-strong"}`}>
            {journalCorrect ? "Correct" : "Not quite"}
          </p>
          {!journalCorrect && <p className="mt-2 text-sm leading-6 text-ink-muted">Your guess: {journalGuess}</p>}
          <p className="mt-1 font-serif text-xl leading-7 text-ink">{round.answer.journal}</p>
        </div>
        <div className="bg-surface p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">Citations</p>
          <p className={`mt-3 text-sm font-semibold ${citationCorrect ? "text-correct-strong" : "text-wrong-strong"}`}>
            {citationCorrect ? "Correct" : "Not quite"}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">Your range: {citationGuess.replace("1001+", ">1000")}</p>
          <p className="mt-1 font-serif text-xl text-ink">{round.answer.citations.toLocaleString("en")} citations</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-ink/15 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <a href={round.answer.viewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-strong underline decoration-accent-strong/30 underline-offset-4 hover:decoration-accent-strong">
            View paper <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <p className="mt-2 text-xs text-ink-muted">Citation source: OpenAlex · Retrieved {retrieved}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="rounded-none" onClick={onChangeField}>Change Topic</Button>
          <Button className="h-11 rounded-none bg-accent-strong px-6 text-white hover:bg-ink" onClick={onNext}>
            Next Paper <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
