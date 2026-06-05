import { FormEvent, useState } from "react";
import { Send, Loader2, Mic, MicOff } from "lucide-react";
import { useSpeechDictation } from "../../hooks/useSpeechDictation";
import { Button } from "../UI/Button";

interface ChatComposerProps {
  disabled: boolean;
  isGenerating: boolean;
  onSend: (question: string) => void;
}

export function ChatComposer({
  disabled,
  isGenerating,
  onSend
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const dictation = useSpeechDictation({
    onText: (text) => {
      setValue((current) => [current.trim(), text].filter(Boolean).join(" "));
    }
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!value.trim()) {
      return;
    }

    onSend(value);
    setValue("");
  }

  return (
    <form
      className="sticky bottom-0 mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
      onSubmit={handleSubmit}
    >
      <div className="flex items-end gap-2">
        <textarea
          className="min-h-12 max-h-36 flex-1 resize-none rounded-[1.15rem] bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
          rows={1}
          value={value}
          placeholder="Pose une question sur le programme EVA..."
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Button
          className={`h-12 w-12 shrink-0 px-0 ${
            dictation.isListening
              ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
              : ""
          }`}
          disabled={disabled || isGenerating || !dictation.isSupported}
          aria-label={dictation.isListening ? "Arreter la dictee" : "Dicter une question"}
          title={
            dictation.isSupported
              ? "Dicter une question"
              : "Dictee non disponible sur ce navigateur"
          }
          type="button"
          variant={dictation.isListening ? "primary" : "ghost"}
          onClick={dictation.toggle}
        >
          {dictation.isListening ? <MicOff size={19} /> : <Mic size={19} />}
        </Button>
        <Button
          className="h-12 w-12 shrink-0 px-0"
          disabled={disabled || isGenerating || !value.trim()}
          aria-label="Envoyer"
          type="submit"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={19} />
          ) : (
            <Send size={19} />
          )}
        </Button>
      </div>
      {dictation.error && (
        <p className="px-3 pb-1 pt-2 text-xs text-amber-200">
          {dictation.error}
        </p>
      )}
    </form>
  );
}
