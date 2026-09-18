import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { citationRanges, type CitationRangeId } from "@/lib/types";
import { Check, X } from "lucide-react";

type Props = {
  value: CitationRangeId | null;
  onChange: (value: CitationRangeId) => void;
  revealed: boolean;
  actual?: CitationRangeId;
};

export function CitationQuiz({ value, onChange, revealed, actual }: Props) {
  return (
    <section aria-labelledby="citation-question" className="py-12">
      <div className="mb-7 flex items-start gap-4">
        <span className="font-serif text-xl text-accent-strong">02</span>
        <h2 id="citation-question" className="font-serif text-2xl text-ink sm:text-3xl">How many times has this paper been cited?</h2>
      </div>
      <RadioGroup value={value ?? ""} onValueChange={(next) => onChange(next as CitationRangeId)} disabled={revealed} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {citationRanges.map((range, index) => {
          const selected = value === range.id;
          const correct = revealed && actual === range.id;
          const wrong = revealed && selected && !correct;
          return (
            <label key={range.id} htmlFor={`citation-${range.id}`} className={`flex min-h-20 cursor-pointer flex-col justify-between border border-ink/20 bg-surface p-3 transition-colors hover:border-ink/50 ${selected && !revealed ? "border-accent-strong bg-selection" : ""} ${correct ? "border-correct-strong bg-correct" : ""} ${wrong ? "border-wrong-strong bg-wrong" : ""}`}>
              <span className="flex items-center justify-between text-xs font-semibold text-ink-muted">
                {String.fromCharCode(65 + index)}
                <RadioGroupItem id={`citation-${range.id}`} value={range.id} />
              </span>
              <span className="flex items-center gap-1.5 text-lg font-semibold tabular-nums text-ink">
                {range.label}
                {correct && <Check className="size-4 text-correct-strong" />}
                {wrong && <X className="size-4 text-wrong-strong" />}
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </section>
  );
}
