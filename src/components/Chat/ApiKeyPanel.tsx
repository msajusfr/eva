import { KeyRound, SlidersHorizontal } from "lucide-react";
import { TextInput } from "../UI/TextInput";
import type { AssistantSettings } from "../../types";

interface ApiKeyPanelProps {
  apiKey: string;
  settings: AssistantSettings;
  onApiKeyChange: (value: string) => void;
  onProviderChange: (provider: AssistantSettings["provider"]) => void;
  onModelChange: (model: string) => void;
}

export function ApiKeyPanel({
  apiKey,
  settings,
  onApiKeyChange,
  onProviderChange,
  onModelChange
}: ApiKeyPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-300/15 text-amber-100 ring-1 ring-amber-100/20">
          <KeyRound size={19} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Connexion LLM</p>
          <p className="text-xs text-slate-400">Stockee localement dans le navigateur</p>
        </div>
      </div>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950/45 p-1 ring-1 ring-white/10">
          {(["openai", "openrouter"] as const).map((provider) => (
            <button
              key={provider}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                settings.provider === provider
                  ? "bg-cyan-300 text-slate-950"
                  : "text-slate-300 hover:bg-white/[0.06]"
              }`}
              type="button"
              onClick={() => onProviderChange(provider)}
            >
              {provider === "openai" ? "OpenAI" : "OpenRouter"}
            </button>
          ))}
        </div>
        <TextInput
          label="Cle API"
          type="password"
          value={apiKey}
          placeholder="sk-..."
          autoComplete="off"
          onChange={(event) => onApiKeyChange(event.target.value)}
        />
        <label className="grid gap-2 text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={15} />
            Modele
          </span>
          <input
            className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
            value={settings.model}
            onChange={(event) => onModelChange(event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
