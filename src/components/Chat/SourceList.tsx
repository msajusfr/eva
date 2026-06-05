import { useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import type { SearchResult } from "../../types";

interface SourceListProps {
  sources: SearchResult[];
}

export function SourceList({ sources }: SourceListProps) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-xs font-semibold text-cyan-100 ring-1 ring-white/10"
        onClick={() => setOpen((current) => !current)}
      >
        <Quote size={14} />
        {sources.length} sources
        <ChevronDown
          className={`transition ${open ? "rotate-180" : ""}`}
          size={14}
        />
      </button>
      {open && (
        <div className="mt-3 grid gap-2">
          {sources.map((source) => (
            <article
              key={source.id}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-3"
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>Page {source.page}</span>
                <span>score {source.score.toFixed(2)}</span>
              </div>
              <p className="line-clamp-5 text-sm leading-6 text-slate-300">
                {source.text}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
