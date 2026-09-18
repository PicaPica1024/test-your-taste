import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { JournalOption } from "@/lib/types";
import { Check, X } from "lucide-react";

type Props = {
  options: JournalOption[];
  value: string | null;
  onChange: (value: string) => void;
  revealed: boolean;
  actual?: string;
};

export function JournalQuiz({ options, value, onChange, revealed, actual }: Props) {
  return (
    <section aria-labelledby="journal-question" className="border-b border-ink/15 py-12">
      <div className="mb-7 flex items-start gap-4">
        <span className="font-serif text-xl text-accent-strong">01</span>
        <div>
          <h2 id="journal-question" className="font-serif text-2xl text-ink sm:text-3xl">
            Where was this paper published?
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Journals are arranged by approximate field reputation, not by answer position.
          </p>
        </div>
      </div>
      <RadioGroup value={value ?? ""} onValueChange={onChange} disabled={revealed} className="grid gap-px border border-ink/15 bg-ink/15">
        {options.map((option, index) => {
          const selected = value === option.name;
          const correct = revealed && actual === option.name;
          const wrong = revealed && selected && !correct;
          return (
            <label key={option.name} htmlFor={`journal-${index}`} className={`group flex min-h-14 cursor-pointer items-center gap-4 bg-surface px-4 py-3 transition-colors sm:px-5 ${selected && !revealed ? "bg-selection" : "hover:bg-paper"} ${correct ? "bg-correct" : ""} ${wrong ? "bg-wrong" : ""}`}>
              <RadioGroupItem id={`journal-${index}`} value={option.name} />
              <span className="flex-1 text-[0.98rem] font-medium text-ink sm:text-base">{option.name}</span>
              <span className="text-sm tabular-nums text-ink-muted">0{index + 1}</span>
              {correct && <Check className="size-4 text-correct-strong" aria-label="Correct answer" />}
              {wrong && <X className="size-4 text-wrong-strong" aria-label="Incorrect answer" />}
            </label>
          );
        })}
      </RadioGroup>
    </section>
  );
}
