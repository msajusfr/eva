import { useCallback, useEffect, useMemo, useState } from "react";
import { createChunks } from "../services/chunkService";
import { generateAnswer, generateLocalAnswer } from "../services/llmService";
import { extractPdfText } from "../services/pdfService";
import { searchChunks } from "../services/searchService";
import type { ChatMessage, ConversationState, PdfChunk, PdfIndexState } from "../types";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_STATE: ConversationState = {
  messages: [],
  apiKey: "",
  settings: {
    provider: "openai",
    model: "gpt-4o-mini"
  }
};

const PDF_URL = "/CLUB-EVA-PROGRAMME.pdf";

export function useEvaAssistant() {
  const [conversation, setConversation] = useLocalStorage<ConversationState>(
    "eva-conversation",
    DEFAULT_STATE
  );
  const [chunks, setChunks] = useState<PdfChunk[]>([]);
  const [indexState, setIndexState] = useState<PdfIndexState>({
    status: "idle",
    pageCount: 0,
    chunkCount: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        setIndexState({ status: "loading", pageCount: 0, chunkCount: 0 });
        const pages = await extractPdfText(PDF_URL);
        const nextChunks = createChunks(pages);

        if (!cancelled) {
          setChunks(nextChunks);
          setIndexState({
            status: "ready",
            pageCount: pages.length,
            chunkCount: nextChunks.length
          });
        }
      } catch (error) {
        if (!cancelled) {
          setIndexState({
            status: "error",
            pageCount: 0,
            chunkCount: 0,
            error: error instanceof Error ? error.message : "Erreur PDF"
          });
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, []);

  const canAsk = useMemo(
    () => indexState.status === "ready" && !isGenerating,
    [indexState.status, isGenerating]
  );

  const updateApiKey = useCallback(
    (apiKey: string) => {
      setConversation((current) => ({ ...current, apiKey }));
    },
    [setConversation]
  );

  const updateProvider = useCallback(
    (provider: ConversationState["settings"]["provider"]) => {
      setConversation((current) => ({
        ...current,
        settings: {
          provider,
          model:
            provider === "openrouter"
              ? "openai/gpt-4o-mini"
              : "gpt-4o-mini"
        }
      }));
    },
    [setConversation]
  );

  const updateModel = useCallback(
    (model: string) => {
      setConversation((current) => ({
        ...current,
        settings: { ...current.settings, model }
      }));
    },
    [setConversation]
  );

  const resetConversation = useCallback(() => {
    setConversation((current) => ({ ...current, messages: [] }));
  }, [setConversation]);

  const sendQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();

      if (!trimmed || !canAsk) {
        return;
      }

      const sources = searchChunks(chunks, trimmed, 5);
      const userMessage = createMessage("user", trimmed);

      if (sources.length === 0) {
        setConversation((current) => ({
          ...current,
          messages: [
            ...current.messages,
            userMessage,
            createMessage(
              "assistant",
              "Je ne trouve pas cette information dans le document."
            )
          ]
        }));
        return;
      }

      setConversation((current) => ({
        ...current,
        messages: [...current.messages, userMessage]
      }));
      setIsGenerating(true);

      try {
        const answer = await generateAnswer({
          apiKey: conversation.apiKey,
          question: trimmed,
          sources,
          settings: conversation.settings
        });
        const assistantMessage = createMessage("assistant", answer, sources);

        setConversation((current) => ({
          ...current,
          messages: [...current.messages, assistantMessage]
        }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Impossible de generer une reponse.";

        setConversation((current) => ({
          ...current,
          messages: [
            ...current.messages,
            createMessage(
              "assistant",
              `L'appel au modele a echoue: ${message}\n\n${generateLocalAnswer(
                trimmed,
                sources
              )}`,
              sources
            )
          ]
        }));
      } finally {
        setIsGenerating(false);
      }
    },
    [canAsk, chunks, conversation.apiKey, conversation.settings, setConversation]
  );

  return {
    conversation,
    indexState,
    isGenerating,
    canAsk,
    updateApiKey,
    updateProvider,
    updateModel,
    resetConversation,
    sendQuestion
  };
}

function createMessage(
  role: ChatMessage["role"],
  content: string,
  sources?: ChatMessage["sources"]
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
    sources
  };
}
