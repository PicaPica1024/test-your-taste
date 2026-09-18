import { percentage } from "@/lib/scoring";
import type { SessionStats } from "@/lib/types";

export function ScoreBar({ stats }: { stats: SessionStats }) {
  const items = [
    { label: "Score", value: `${stats.points} / ${stats.papersPlayed * 2}` },
    { label: "Papers", value: String(stats.papersPlayed) },
    { label: "Journal", value: `${percentage(stats.journalCorrect, stats.papersPlayed)}%` },
    { label: "Citations", value: `${percentage(stats.citationCorrect, stats.papersPlayed)}%` },
    { label: "Streak", value: String(stats.streak) },
  ];
  return (
    <aside aria-label="Session score" className="grid grid-cols-2 gap-px border border-ink/15 bg-ink/15 sm:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-3 py-3 sm:px-4">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-ink-muted">{item.label}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{item.value}</p>
        </div>
      ))}
    </aside>
  );
}
