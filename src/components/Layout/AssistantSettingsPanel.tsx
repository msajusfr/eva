import { ChevronDown, Settings2 } from "lucide-react";
import { useState } from "react";
import { ApiKeyPanel } from "../Chat/ApiKeyPanel";
import { PdfStatusPanel } from "../Pdf/PdfStatusPanel";
import type { AssistantSettings, PdfIndexState } from "../../types";

interface AssistantSettingsPanelProps {
  apiKey: string;
  settings: AssistantSettings;
  indexState: PdfIndexState;
  onApiKeyChange: (value: string) => void;
  onProviderChange: (provider: AssistantSettings["provider"]) => void;
  onModelChange: (model: string) => void;
}

export function AssistantSettingsPanel({
  apiKey,
  settings,
  indexState,
  onApiKeyChange,
  onProviderChange,
  onModelChange
}: AssistantSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="grid content-start gap-4">
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <button
          className="flex w-full items-center justify-between gap-4 text-left"
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.07] text-cyan-200 ring-1 ring-white/10">
              <Settings2 size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Document et configuration
              </p>
              <p className="mt-1 truncate text-xs text-slate-400">
                {indexState.status === "ready"
                  ? `${indexState.pageCount} pages - ${settings.provider} / ${settings.model}`
                  : "Preparation du document"}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
            size={19}
          />
        </button>
      </section>

      {isOpen && (
        <div className="grid gap-4">
          <PdfStatusPanel state={indexState} />
          <ApiKeyPanel
            apiKey={apiKey}
            settings={settings}
            onApiKeyChange={onApiKeyChange}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-400 backdrop-blur-xl">
            <p className="font-semibold text-slate-200">Mode local</p>
            <p className="mt-1">
              Sans cle API, EVA repond deja a partir du document. Avec une cle,
              il peut enrichir la synthese a partir des sources retrouvees.
            </p>
          </section>
        </div>
      )}
    </aside>
  );
}
