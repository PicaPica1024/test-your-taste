"use client";

import { Button } from "@/components/ui/button";
import { disciplines, type Discipline } from "@/config/disciplines";
import { careerStages, type CareerStageId } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

export type ResearchSelection =
  | { kind: "discipline"; label: string; discipline: Discipline }
  | { kind: "keyword"; label: string; keyword: string };

type Props = {
  value: ResearchSelection | null;
  onChange: (selection: ResearchSelection | null) => void;
  onStart: (selection: ResearchSelection) => void;
  careerStage: CareerStageId;
  onCareerStageChange: (stage: CareerStageId) => void;
  loading?: boolean;
};

export function DisciplineSelector({
  value,
  onChange,
  onStart,
  careerStage,
  onCareerStageChange,
  loading = false,
}: Props) {
  const [inputValue, setInputValue] = useState(value?.label ?? "");

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
    if (!resolvedSelection || loading) return;
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
            科研判断力游戏
          </div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-strong">
            先看研究，再看声望
          </p>
          <h1 className="font-serif text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.82] tracking-[-0.055em] text-ink">
            Test Your
            <br />
            Taste<span className="text-accent-strong">.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-ink-muted sm:text-xl">
            隐去作者和来源，只看年份、标题与摘要，你能判断研究的发表档次和影响力吗？
          </p>
        </div>

        <div className="border-t-2 border-ink pt-7 lg:mb-1">
          <label className="mb-3 block text-sm font-semibold text-ink" htmlFor="field-search">
            选择学科或输入关键词
          </label>
          <form
            aria-busy={loading}
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
              disabled={loading}
              autoComplete="off"
              aria-label="选择研究领域或输入关键词"
              placeholder="例如：生态学、湖泊恢复"
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
              disabled={!resolvedSelection || loading}
            >
              {loading ? "正在找论文…" : "开始"}
              {!loading && <ArrowRight aria-hidden="true" />}
            </Button>
          </form>
          {loading && (
            <p className="mt-3 text-sm leading-6 text-ink-muted" aria-live="polite">
              正在检索“{value?.label ?? normalizedInput}”…
            </p>
          )}
          <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="career-stage">
            你的职业阶段
          </label>
          <select
            id="career-stage"
            value={careerStage}
            onChange={(event) => onCareerStageChange(event.target.value as CareerStageId)}
            disabled={loading}
            className="mt-2 h-11 w-full border border-ink/25 bg-surface px-3 text-sm text-ink outline-none focus:border-accent-strong"
          >
            {careerStages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
          </select>
          <p className="mt-4 text-sm leading-6 text-ink-muted">
            只使用 OpenAlex 中的中文或英文论文，且论文至少发表十年。无需姓名、邮箱或账号。
          </p>
        </div>
      </section>
    </main>
  );
}
