import { Button } from "@/components/ui/button";

type Props = {
  busy: boolean;
  onNew: () => void;
  onSkip: (reason: "read" | "unsure") => void;
};

export function FamiliarityCheck({ busy, onNew, onSkip }: Props) {
  return (
    <section className="my-10 border-2 border-ink bg-surface p-5 sm:p-7" aria-labelledby="familiarity-question">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-strong">作答前确认</p>
      <h2 id="familiarity-question" className="mt-2 font-serif text-2xl text-ink sm:text-3xl">
        你以前读过或认出这篇论文吗？
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
        如果读过或不确定，就换一篇同档次论文，不计分，也不会打乱本组五轮的分档平衡。
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        <Button className="h-11 rounded-none bg-ink text-paper hover:bg-accent-strong" disabled={busy} onClick={onNew}>
          没读过，开始作答
        </Button>
        <Button variant="outline" className="h-11 rounded-none" disabled={busy} onClick={() => onSkip("read")}>
          读过 / 认出来了
        </Button>
        <Button variant="ghost" className="h-11 rounded-none" disabled={busy} onClick={() => onSkip("unsure")}>
          不确定，换一篇
        </Button>
      </div>
    </section>
  );
}
