export interface PdfPageText {
  page: number;
  text: string;
}

export interface PdfChunk {
  id: string;
  text: string;
  page: number;
  title?: string;
}

export interface SearchResult extends PdfChunk {
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: SearchResult[];
}

export interface ConversationState {
  messages: ChatMessage[];
  apiKey: string;
  settings: AssistantSettings;
}

export interface AssistantSettings {
  provider: "openai" | "openrouter";
  model: string;
}

export interface PdfIndexState {
  status: "idle" | "loading" | "ready" | "error";
  pageCount: number;
  chunkCount: number;
  error?: string;
}
