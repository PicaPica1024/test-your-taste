type Props = {
  year: number;
  title: string;
  abstract: string;
};

export function PaperCard({ year, title, abstract }: Props) {
  return (
    <article className="border-b border-ink/15 pb-12">
      <div className="mb-7 flex items-center gap-4">
        <span className="bg-accent-strong px-3 py-1.5 text-sm font-bold tabular-nums text-white">
          {year}
        </span>
        <span className="h-px flex-1 bg-ink/15" />
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Journal hidden
        </span>
      </div>
      <h1 className="max-w-[23ch] font-serif text-[clamp(2.35rem,5.5vw,4.8rem)] leading-[1.02] tracking-[-0.035em] text-ink">
        {title}
      </h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-[7rem_1fr] sm:gap-8">
        <h2 className="pt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
          Abstract
        </h2>
        <p className="max-w-[72ch] font-serif text-[1.08rem] leading-[1.85] text-ink/90 sm:text-[1.16rem]">
          {abstract}
        </p>
      </div>
    </article>
  );
}
