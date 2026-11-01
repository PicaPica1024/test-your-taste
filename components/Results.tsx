import { Button } from "@/components/ui/button";
import { venueTiers, type BenchmarkSummary, type CitationRangeId, type RoundResult, type VenueTierId } from "@/lib/types";
import { ArrowRight, ExternalLink } from "lucide-react";
import { BenchmarkStats } from "./BenchmarkStats";

type Props = {
  result: RoundResult;
  venueGuess: VenueTierId;
  citationGuess: CitationRangeId;
  benchmark: BenchmarkSummary[];
  onNext: () => void;
  onChangeField: () => void;
};

const tierLabel = (id: VenueTierId) => venueTiers.find((tier) => tier.id === id)?.label ?? id;

export function Results({ result, venueGuess, citationGuess, benchmark, onNext, onChangeField }: Props) {
  const retrieved = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(result.retrievedAt));

  return (
    <section className="mb-10 border-2 border-ink bg-surface" aria-live="polite">
      <div className="flex items-center justify-between border-b border-ink bg-ink px-5 py-4 text-paper sm:px-7">
        <h2 className="font-serif text-2xl">结果</h2>
        <p className="text-sm font-bold uppercase tracking-[0.12em]">本轮 {result.score} / 2 分</p>
      </div>
      <div className="grid gap-px bg-ink/15 sm:grid-cols-2">
        <div className="bg-surface p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">发表档次</p>
          <p className={`mt-3 text-sm font-semibold ${result.venueCorrect ? "text-correct-strong" : "text-wrong-strong"}`}>
            {result.venueCorrect ? "答对了" : "不太对"}
          </p>
          {!result.venueCorrect && <p className="mt-2 text-sm leading-6 text-ink-muted">你的答案：{tierLabel(venueGuess)}</p>}
          <p className="mt-1 font-serif text-xl leading-7 text-ink">{tierLabel(result.actualVenueTier)}</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">实际来源：{result.actualJournal}</p>
          <p className="mt-2 text-xs leading-5 text-ink-muted">{result.classificationNote}</p>
        </div>
        <div className="bg-surface p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">引用量</p>
          <p className={`mt-3 text-sm font-semibold ${result.citationCorrect ? "text-correct-strong" : "text-wrong-strong"}`}>
            {result.citationCorrect ? "答对了" : "不太对"}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">你的区间：{citationGuess.replace("1001+", ">1000")}</p>
          <p className="mt-1 font-serif text-xl text-ink">{result.actualCitations.toLocaleString("zh-CN")} 次引用</p>
        </div>
      </div>
      <BenchmarkStats summaries={benchmark} />
      <div className="flex flex-col gap-4 border-t border-ink/15 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <a href={result.viewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-strong underline decoration-accent-strong/30 underline-offset-4 hover:decoration-accent-strong">
            查看原论文 <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <p className="mt-2 text-xs text-ink-muted">引用数据：OpenAlex · 获取于 {retrieved}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="rounded-none" onClick={onChangeField}>更换主题</Button>
          <Button className="h-11 rounded-none bg-accent-strong px-6 text-white hover:bg-ink" onClick={onNext}>
            下一篇 <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
