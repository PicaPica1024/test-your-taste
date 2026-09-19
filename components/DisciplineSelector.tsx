"use client";

import { Button } from "@/components/ui/button";
import { disciplines, type Discipline } from "@/config/disciplines";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ResearchSelection =
  | { kind: "discipline"; label: string; discipline: Discipline }
  | { kind: "keyword"; label: string; keyword: string };

type Props = {
  value: ResearchSelection | null;
  onChange: (selection: ResearchSelection | null) => void;
  onStart: (selection: ResearchSelection) => void;
};

export function DisciplineSelector({ value, onChange, onStart }: Props) {
  const [inputValue, setInputValue] = useState(value?.label ?? "");
  useEffect(() => {
    if (value) setInputValue(value.label);
  }, [value]);

  const normalizedInput = inputValue.trim().replace(/\s+/g, " ");
  const resolvedSelection = useMemo<ResearchSelection | null>(() => {
    if (normalizedInput.length < 2 || normalizedInput.length > 120) return null;
    const exact = disciplines.find(
      (discipline) =>
        discipline.name.toLowerCase() === normalizedInput.toLowerCase(),
    );
    if (exact) {
      return { kind: "discipline", label: exact.name, discipline: exact };
    }
    return {
      kind: "keyword",
      label: normalizedInput,
      keyword: normalizedInput,
    };
  }, [normalizedInput]);

  function start() {
    if (!resolvedSelection) return;
    onChange(resolvedSelection);
    onStart(resolvedSelection);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1160px] items-center px-5 py-12 sm:px-8 lg:px-12">
      <section className="grid w-full items-end gap-12 lg:grid-cols-[1fr_0.82fr] lg:gap-24">
        <div className="max-w-2xl">
          <div className="mb-12 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
            <span className="grid size-8 place-items-center border border-ink/20 font-serif text-base normal-case tracking-normal text-ink">
              T²
            </span>
            Scientific judgment game
          </div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-strong">
            Read first. Reputation later.
          </p>
          <h1 className="font-serif text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.82] tracking-[-0.055em] text-ink">
            Test Your
            <br />
            Taste<span className="text-accent-strong">.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-ink-muted sm:text-xl">
            Can you recognize an influential paper before knowing where it was
            published?
          </p>
        </div>

        <div className="border-t-2 border-ink pt-7 lg:mb-1">
          <p className="mb-8 max-w-md font-serif text-2xl leading-9 text-ink">
            Read a real paper. Guess the journal. Guess its impact.
          </p>
          <label className="mb-3 block text-sm font-semibold text-ink" htmlFor="field-search">
            Choose a field or enter keywords
          </label>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              start();
            }}
          >
            <input
              id="field-search"
              list="research-field-options"
              value={inputValue}
              onChange={(event) => {
                const next = event.target.value;
                setInputValue(next);
                if (value && next !== value.label) onChange(null);
              }}
              minLength={2}
              maxLength={120}
              autoComplete="off"
              aria-label="Choose a research field or enter keywords"
              placeholder="e.g. ecology or lake restoration"
              className="h-12 w-full border border-ink/25 bg-surface px-3 text-base text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent-strong"
            />
            <datalist id="research-field-options">
              {disciplines.map((discipline) => (
                <option key={discipline.slug} value={discipline.name}>
                  {discipline.group}
                </option>
              ))}
            </datalist>
            <Button
              type="submit"
              size="lg"
              className="mt-4 h-12 w-full rounded-none bg-ink text-base text-paper hover:bg-accent-strong"
              disabled={!resolvedSelection}
            >
              Start
              <ArrowRight aria-hidden="true" />
            </Button>
          </form>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Choose a suggestion, or keep your own keywords and press Start.
          </p>
          <p className="mt-4 text-sm leading-6 text-ink-muted">
            English and Chinese papers only. Papers are selected from OpenAlex
            and were published at least ten years ago.
          </p>
        </div>
      </section>
    </main>
  );
}
