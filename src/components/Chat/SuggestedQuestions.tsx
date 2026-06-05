import { ListChecks } from "lucide-react";
import { suggestedQuestions } from "../../data/suggestedQuestions";

interface SuggestedQuestionsProps {
  disabled: boolean;
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({
  disabled,
  onSelect
}: SuggestedQuestionsProps) {
  return (
    <section className="mt-3 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-3">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        <ListChecks size={15} />
        Questions suggérées
      </div>
      <div className="grid max-h-40 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {suggestedQuestions.map((question) => (
          <button
            key={question}
            className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-left text-sm leading-5 text-slate-200 transition hover:border-cyan-200/40 hover:bg-cyan-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            disabled={disabled}
            type="button"
            onClick={() => onSelect(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}
