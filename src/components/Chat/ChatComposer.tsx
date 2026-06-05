import { FormEvent, useState } from "react";
import { Send, Loader2 } from "lucide-react";
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
    </form>
  );
}
