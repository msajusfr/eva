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

export function generateLocalAnswer(question: string, sources: SearchResult[]): string {
  return buildLocalAnswer(question, sources);
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
  const excerpt = findRelevantExcerpt(best.text, question);

  return `Voici l'extrait le plus pertinent trouve dans le document pour "${question}".\n\nPage ${best.page}: ${excerpt}`;
}

function findRelevantExcerpt(text: string, question: string): string {
  const terms = getQuestionTerms(question);
  const lowerText = text.toLocaleLowerCase("fr");
  const firstMatch = terms
    .map((term) => lowerText.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (firstMatch === undefined) {
    return text.length > 460 ? `${text.slice(0, 460).trim()}...` : text;
  }

  const start = Math.max(0, firstMatch - 160);
  const end = Math.min(text.length, firstMatch + 360);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

function getQuestionTerms(question: string): string[] {
  const normalized = question
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  if (/(tarif|prix|cout|inscription)/.test(normalized)) {
    return ["participation", "gratuite", "contribution", "engagement"];
  }

  if (/(presente|presentation|eva)/.test(normalized)) {
    return ["club eva", "think tank", "structure ouverte", "partenariat"];
  }

  return normalized.split(/[^a-z0-9]+/).filter((term) => term.length > 3);
}
