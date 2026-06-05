import { useEffect, useRef } from "react";
import { MessageCircle, RotateCcw } from "lucide-react";
import type { ChatMessage } from "../../types";
import { Button } from "../UI/Button";
import { ChatComposer } from "./ChatComposer";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  messages: ChatMessage[];
  canAsk: boolean;
  isGenerating: boolean;
  onSend: (question: string) => void;
  onReset: () => void;
}

export function ChatPanel({
  messages,
  canAsk,
  isGenerating,
  onSend,
  onReset
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isGenerating]);

  return (
    <section className="flex min-h-[68vh] flex-1 flex-col rounded-[2rem] border border-white/10 bg-white/[0.055] p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-1 pb-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.07] text-cyan-200 ring-1 ring-white/10">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="font-semibold text-white">Assistant programme</p>
            <p className="text-xs text-slate-400">Reponse avec sources du PDF</p>
          </div>
        </div>
        <Button
          className="h-10 min-h-10 px-3"
          disabled={messages.length === 0}
          variant="ghost"
          type="button"
          onClick={onReset}
          aria-label="Reinitialiser"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-4">
        {messages.length === 0 ? (
          <div className="grid h-full min-h-80 place-items-center rounded-[1.5rem] border border-dashed border-white/12 bg-slate-950/20 px-5 text-center">
            <div className="max-w-md">
              <p className="text-2xl font-bold tracking-tight text-white">
                Demande-moi ce que contient le programme.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Exemples: les tarifs, les conditions d'inscription, le planning,
                les activites ou les points importants du document.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-slate-300">
                  Generation en cours...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <ChatComposer disabled={!canAsk} isGenerating={isGenerating} onSend={onSend} />
    </section>
  );
}
