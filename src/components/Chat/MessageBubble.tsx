import { Bot, User } from "lucide-react";
import type { ChatMessage } from "../../types";
import { SourceList } from "./SourceList";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-slate-950">
          <Bot size={18} />
        </div>
      )}
      <div
        className={`max-w-[88%] rounded-[1.35rem] px-4 py-3 shadow-lg sm:max-w-[76%] ${
          isUser
            ? "bg-cyan-300 text-slate-950 shadow-cyan-950/20"
            : "border border-white/10 bg-white/[0.07] text-slate-100 shadow-black/20"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.content}
        </p>
        {!isUser && <SourceList sources={message.sources ?? []} />}
      </div>
      {isUser && (
        <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white/[0.08] text-slate-100 ring-1 ring-white/10">
          <User size={18} />
        </div>
      )}
    </div>
  );
}
