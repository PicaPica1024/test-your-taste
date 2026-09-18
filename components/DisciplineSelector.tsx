"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import {
  disciplineGroups,
  disciplines,
  type Discipline,
} from "@/config/disciplines";
import { openAlexMappings } from "@/config/openAlexMappings";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  value: Discipline | null;
  onChange: (discipline: Discipline | null) => void;
  onStart: () => void;
};

export function DisciplineSelector({ value, onChange, onStart }: Props) {
  const names = disciplines.map((discipline) => discipline.name);
  const [inputValue, setInputValue] = useState(value?.name ?? "");
  useEffect(() => {
    if (value) setInputValue(value.name);
  }, [value]);

  const filteredDisciplines = useMemo(() => {
    const normalized = inputValue.trim().toLowerCase();
    if (!normalized || normalized === value?.name.toLowerCase()) return disciplines;
    return disciplines.filter((discipline) => {
      const aliases =
        discipline.slug === "biodiversity-conservation" ? ["ecology"] : [];
      return [
        discipline.name,
        discipline.group,
        ...(openAlexMappings[discipline.slug] ?? []),
        ...aliases,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [inputValue, value]);

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
            Choose a research field
          </label>
          <Combobox
            items={names}
            filteredItems={filteredDisciplines.map((item) => item.name)}
            inputValue={inputValue}
            onInputValueChange={(next) => {
              setInputValue(next);
              if (value && next !== value.name) onChange(null);
            }}
            value={value?.name ?? null}
            onValueChange={(name) => {
              const next = disciplines.find((item) => item.name === name) ?? null;
              onChange(next);
            }}
          >
            <ComboboxInput
              id="field-search"
              aria-label="Search research fields"
              placeholder="Search fields, e.g. ecology"
              showClear
              className="h-12 w-full rounded-none border-ink/25 bg-surface text-base shadow-none focus-within:border-accent-strong"
            />
            <ComboboxContent className="rounded-none border border-ink/15 shadow-[0_20px_60px_rgb(16_32_48/14%)]">
              <ComboboxEmpty>No matching research field.</ComboboxEmpty>
              <ComboboxList>
                {disciplineGroups.map((group) => (
                  filteredDisciplines.some((discipline) => discipline.group === group) && <ComboboxGroup key={group}>
                    <ComboboxLabel className="text-xs font-semibold uppercase tracking-[0.12em]">
                      {group}
                    </ComboboxLabel>
                    {filteredDisciplines
                      .filter((discipline) => discipline.group === group)
                      .map((discipline) => (
                        <ComboboxItem
                          key={discipline.slug}
                          value={discipline.name}
                          className="min-h-10 rounded-none text-[0.95rem]"
                        >
                          {discipline.name}
                        </ComboboxItem>
                      ))}
                  </ComboboxGroup>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <Button
            size="lg"
            className="mt-4 h-12 w-full rounded-none bg-ink text-base text-paper hover:bg-accent-strong"
            disabled={!value}
            onClick={onStart}
          >
            Start
            <ArrowRight aria-hidden="true" />
          </Button>
          <p className="mt-4 text-sm leading-6 text-ink-muted">
            Papers are selected from OpenAlex and were published at least ten
            years ago.
          </p>
        </div>
      </section>
    </main>
  );
}
