import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, X } from "lucide-react";

type Props = {
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  revealed: boolean;
  actual?: string;
};

const letters = ["A", "B", "C", "D", "E"];

export function JournalQuiz({ options, value, onChange, revealed, actual }: Props) {
  return (
    <section aria-labelledby="journal-question" className="border-b border-ink/15 py-12">
      <div className="mb-7 flex items-start gap-4">
        <span className="font-serif text-xl text-accent-strong">01</span>
        <div>
          <h2 id="journal-question" className="font-serif text-2xl text-ink sm:text-3xl">
            这项研究发表在哪本期刊或会议？
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">请选择你认为最可能的真实来源。</p>
        </div>
      </div>
      <RadioGroup
        value={value ?? ""}
        onValueChange={onChange}
        disabled={revealed}
        className="grid gap-px border border-ink/15 bg-ink/15"
      >
        {options.map((option, index) => {
          const selected = value === option;
          const correct = revealed && actual === option;
          const wrong = revealed && selected && !correct;
          return (
            <label
              key={`${option}-${index}`}
              htmlFor={`journal-${index}`}
              className={`group flex min-h-16 cursor-pointer items-center gap-4 bg-surface px-4 py-3 transition-colors sm:px-5 ${selected && !revealed ? "bg-selection" : "hover:bg-paper"} ${correct ? "bg-correct" : ""} ${wrong ? "bg-wrong" : ""}`}
            >
              <RadioGroupItem id={`journal-${index}`} value={option} />
              <span className="w-5 font-serif text-lg text-accent-strong">{letters[index]}</span>
              <span className="flex-1 text-[0.98rem] font-semibold leading-6 text-ink sm:text-base">{option}</span>
              {correct && <Check className="size-4 text-correct-strong" aria-label="正确答案" />}
              {wrong && <X className="size-4 text-wrong-strong" aria-label="回答错误" />}
            </label>
          );
        })}
      </RadioGroup>
    </section>
  );
}
