import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { venueTiers, type VenueTierId } from "@/lib/types";
import { Check, X } from "lucide-react";

type Props = {
  value: VenueTierId | null;
  onChange: (value: VenueTierId) => void;
  revealed: boolean;
  actual?: VenueTierId;
};

export function VenueTierQuiz({ value, onChange, revealed, actual }: Props) {
  return (
    <section aria-labelledby="venue-question" className="border-b border-ink/15 py-12">
      <div className="mb-7 flex items-start gap-4">
        <span className="font-serif text-xl text-accent-strong">01</span>
        <div>
          <h2 id="venue-question" className="font-serif text-2xl text-ink sm:text-3xl">
            这项研究发表在什么档次的期刊或会议？
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            五轮为一组，每一档各出现一次，顺序随机。
          </p>
        </div>
      </div>
      <RadioGroup
        value={value ?? ""}
        onValueChange={(next) => onChange(next as VenueTierId)}
        disabled={revealed}
        className="grid gap-px border border-ink/15 bg-ink/15"
      >
        {venueTiers.map((option, index) => {
          const selected = value === option.id;
          const correct = revealed && actual === option.id;
          const wrong = revealed && selected && !correct;
          return (
            <label
              key={option.id}
              htmlFor={`venue-${option.id}`}
              className={`group flex min-h-16 cursor-pointer items-center gap-4 bg-surface px-4 py-3 transition-colors sm:px-5 ${selected && !revealed ? "bg-selection" : "hover:bg-paper"} ${correct ? "bg-correct" : ""} ${wrong ? "bg-wrong" : ""}`}
            >
              <RadioGroupItem id={`venue-${option.id}`} value={option.id} />
              <span className="flex-1">
                <span className="block text-[0.98rem] font-semibold text-ink sm:text-base">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-ink-muted">
                  {option.description}
                </span>
              </span>
              <span className="text-sm tabular-nums text-ink-muted">0{index + 1}</span>
              {correct && <Check className="size-4 text-correct-strong" aria-label="正确答案" />}
              {wrong && <X className="size-4 text-wrong-strong" aria-label="回答错误" />}
            </label>
          );
        })}
      </RadioGroup>
    </section>
  );
}
