import { percentage } from "@/lib/scoring";
import type { BenchmarkSummary } from "@/lib/types";

export function BenchmarkStats({ summaries }: { summaries: BenchmarkSummary[] }) {
  if (!summaries.length) return null;
  return (
    <section className="border-t border-ink/15 p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">同学科匿名基准</p>
      <div className="mt-3 grid gap-px bg-ink/15 sm:grid-cols-2">
        {(["human", "ai"] as const).map((type) => {
          const row = summaries.find((item) => item.playerType === type);
          return (
            <div key={type} className="bg-surface p-4">
              <p className="font-semibold text-ink">{type === "human" ? "人类玩家" : "AI 自测"}</p>
              <p className="mt-2 text-sm text-ink-muted">
                档次正确率 {percentage(row?.venueCorrect ?? 0, row?.answers ?? 0)}% · 引用量正确率 {percentage(row?.citationCorrect ?? 0, row?.answers ?? 0)}%
              </p>
              <p className="mt-1 text-xs text-ink-muted">有效答题 {row?.answers ?? 0} 次</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-ink-muted">仅统计预设学科；自定义关键词不进入公开比较。AI 可能在训练中见过论文，因此结果只是参考。</p>
    </section>
  );
}
