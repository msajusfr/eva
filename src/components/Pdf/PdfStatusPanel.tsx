import { CheckCircle2, FileSearch, Loader2, TriangleAlert } from "lucide-react";
import type { PdfIndexState } from "../../types";

interface PdfStatusPanelProps {
  state: PdfIndexState;
}

export function PdfStatusPanel({ state }: PdfStatusPanelProps) {
  const isReady = state.status === "ready";
  const isLoading = state.status === "loading";
  const isError = state.status === "error";

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.07] text-cyan-200 ring-1 ring-white/10">
          {isLoading && <Loader2 className="animate-spin" size={21} />}
          {isReady && <CheckCircle2 size={21} />}
          {isError && <TriangleAlert size={21} />}
          {state.status === "idle" && <FileSearch size={21} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            {isReady && "Document indexe"}
            {isLoading && "Lecture du PDF"}
            {isError && "Document indisponible"}
            {state.status === "idle" && "En attente du document"}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            {isReady &&
              `${state.pageCount} pages analysees, ${state.chunkCount} extraits prets.`}
            {isLoading && "Extraction du texte et preparation de la recherche locale."}
            {isError && state.error}
            {state.status === "idle" && "Le programme EVA sera charge automatiquement."}
          </p>
        </div>
      </div>
    </section>
  );
}
