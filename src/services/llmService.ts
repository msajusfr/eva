import type { AssistantSettings, SearchResult } from "../types";

interface GenerateAnswerInput {
  apiKey: string;
  question: string;
  sources: SearchResult[];
  settings: AssistantSettings;
}

const SYSTEM_PROMPT =
  "Tu es l'assistant du Club EVA. Reponds uniquement avec les informations presentes dans le contexte fourni. Si l'information n'est pas dans le document, dis clairement que tu ne la trouves pas dans le document. Reponds en francais, de facon claire, concise et utile.";

export async function generateAnswer({
  apiKey,
  question,
  sources,
  settings
}: GenerateAnswerInput): Promise<string> {
  if (!apiKey.trim()) {
    return buildLocalAnswer(question, sources);
  }

  const context = sources
    .map(
      (source, index) =>
        `Source ${index + 1} - page ${source.page}\n${source.text}`
    )
    .join("\n\n");

  if (settings.provider === "openrouter") {
    return generateWithOpenRouter({ apiKey, model: settings.model, question, context });
  }

  return generateWithOpenAI({ apiKey, model: settings.model, question, context });
}

async function generateWithOpenAI({
  apiKey,
  model,
  question,
  context
}: {
  apiKey: string;
  model: string;
  question: string;
  context: string;
}): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Contexte du PDF:\n${context}\n\nQuestion:\n${question}`
        }
      ]
    })
  });

  return parseChatCompletion(response);
}

async function generateWithOpenRouter({
  apiKey,
  model,
  question,
  context
}: {
  apiKey: string;
  model: string;
  question: string;
  context: string;
}): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Club EVA Assistant"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Contexte du PDF:\n${context}\n\nQuestion:\n${question}`
        }
      ]
    })
  });

  return parseChatCompletion(response);
}

async function parseChatCompletion(response: Response): Promise<string> {
  if (!response.ok) {
    const details = await response.text();
    throw new Error(readErrorMessage(details));
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return (
    payload.choices?.[0]?.message?.content?.trim() ||
    "Je n'ai pas pu generer de reponse avec le contexte fourni."
  );
}

function readErrorMessage(details: string): string {
  try {
    const payload = JSON.parse(details) as { error?: { message?: string } };
    return payload.error?.message || "La generation a echoue.";
  } catch {
    return details || "La generation a echoue.";
  }
}

function buildLocalAnswer(question: string, sources: SearchResult[]): string {
  if (sources.length === 0) {
    return "Je ne trouve pas cette information dans le document.";
  }

  const best = sources[0];
  const excerpt =
    best.text.length > 420 ? `${best.text.slice(0, 420).trim()}...` : best.text;

  return `Sans cle API, je peux seulement afficher l'extrait le plus pertinent trouve dans le document pour "${question}".\n\nPage ${best.page}: ${excerpt}`;
}
