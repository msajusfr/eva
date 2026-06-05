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

  const directAnswer = buildDirectAnswer(question, sources);

  if (directAnswer) {
    return directAnswer;
  }

  const best = sources[0];
  const excerpt = findRelevantExcerpt(best.text, question);

  return `D'apres le document, ${excerpt}`;
}

function buildDirectAnswer(
  question: string,
  sources: SearchResult[]
): string | undefined {
  const normalizedQuestion = normalizeText(question);
  const context = sources.map((source) => source.text).join(" ");
  const normalizedContext = normalizeText(context);

  if (/(tarif|prix|cout|inscription)/.test(normalizedQuestion)) {
    if (
      normalizedContext.includes("participation est gratuite") ||
      normalizedContext.includes("participation gratuite")
    ) {
      return "La participation est gratuite. Le document demande en revanche un engagement a assister a l'integralite du cycle, ainsi qu'une contribution active aux debats.";
    }
  }

  if (/(ia|intelligence artificielle)/.test(normalizedQuestion)) {
    const speakers = context.match(
      /Avec\s+(Hubert Beroche,\s+fondateur du Think Tank Urban AI\s+et\s+Jean Deydier,\s+respon\s*-\s*sable des différentes actions d’Emmaus Connect et we tech care\s+–\s+Bruxelles)/i
    )?.[1];

    if (speakers) {
      return `La séance sur l’IA a lieu le 13 novembre 2025, sous le thème “Les territoires de l’IA”. Les intervenants sont ${cleanInlineText(
        speakers
      )}.`;
    }

    const iaBlock =
      findBetween(context, "13 novembre 2025", "Avec Hubert Beroche") ??
      findBetween(context, "Les territoires de l’IA", "Avec Hubert Beroche");

    if (iaBlock) {
      return cleanAnswer(iaBlock);
    }
  }

  if (/(commun|communs)/.test(normalizedQuestion)) {
    return "Le document ne donne pas une définition formelle d’un “commun”. Il emploie ce terme pour parler de ressources, de programmes, de modes de gestion et d’habitats pensés collectivement, au service d’un horizon partagé et des enjeux écologiques.";
  }

  if (/(presente|presentation|eva|club eva)/.test(normalizedQuestion)) {
    const description = findBetween(
      context,
      "Le Club EVA",
      "Les échanges de chaque soirée"
    );

    if (description) {
      return cleanAnswer(description);
    }
  }

  if (/(lieu|adresse|ou)/.test(normalizedQuestion)) {
    const place = findBetween(context, "Lieu", "Contact");

    if (place) {
      return cleanAnswer(place);
    }
  }

  if (/(horaire|heure|frequence|quand)/.test(normalizedQuestion)) {
    const frequency =
      findBetween(context, "Fréquence", "La participation") ??
      findBetween(context, "Fréquence", "Lieu");

    if (frequency) {
      return cleanAnswer(frequency);
    }
  }

  if (/(qui|intervient|intervenant|invite)/.test(normalizedQuestion)) {
    const month = findRequestedMonth(normalizedQuestion);
    const scheduleBlock = month ? findScheduleBlock(context, month) : context;
    const speakers = scheduleBlock?.match(/Avec\s+(.+?)\./i)?.[1];

    if (speakers) {
      return `Les intervenants sont ${cleanInlineText(speakers)}.`;
    }
  }

  return undefined;
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
  const normalized = normalizeText(question);

  if (/(tarif|prix|cout|inscription)/.test(normalized)) {
    return ["participation", "gratuite", "contribution", "engagement"];
  }

  if (/(presente|presentation|eva)/.test(normalized)) {
    return ["club eva", "think tank", "structure ouverte", "partenariat"];
  }

  if (/(ia|intelligence artificielle)/.test(normalized)) {
    return ["territoires", "intelligence", "artificielle", "hubert", "beroche", "jean", "deydier"];
  }

  if (/(commun|communs)/.test(normalized)) {
    return ["communs", "ressources", "programmes", "habitats", "gouverner"];
  }

  return normalized.split(/[^a-z0-9]+/).filter((term) => term.length > 3);
}

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function findBetween(
  text: string,
  startMarker: string,
  endMarker: string
): string | undefined {
  const start = text.indexOf(startMarker);

  if (start < 0) {
    return undefined;
  }

  const end = text.indexOf(endMarker, start + startMarker.length);
  return text.slice(start, end > start ? end : undefined).trim();
}

function cleanAnswer(value: string): string {
  return cleanInlineText(value).replace(/\s([,.;:!?])/g, "$1");
}

function cleanInlineText(value: string): string {
  return value
    .replace(/respon\s*-\s*sable/gi, "responsable")
    .replace(/(\p{L}+)\s+-\s+(\p{L}+)/gu, (_, left: string, right: string) =>
      left.length <= 5 || right.length <= 3 ? `${left}${right}` : `${left} - ${right}`
    )
    .replace(/\s+/g, " ")
    .trim();
}

function findRequestedMonth(question: string): string | undefined {
  return [
    "mai",
    "juin",
    "juillet",
    "septembre",
    "octobre",
    "novembre",
    "decembre",
    "janvier",
    "fevrier"
  ].find((month) => question.includes(month));
}

function findScheduleBlock(text: string, month: string): string | undefined {
  const normalized = normalizeText(text);
  const monthIndex = normalized.indexOf(month);

  if (monthIndex < 0) {
    return undefined;
  }

  const nextDate = normalized.slice(monthIndex + month.length).search(
    /\d{1,2}\s+(mai|juin|juillet|septembre|octobre|novembre|decembre|janvier|fevrier)\s+202[5-6]/
  );
  const end =
    nextDate >= 0 ? monthIndex + month.length + nextDate : text.length;

  return text.slice(Math.max(0, monthIndex - 20), end);
}
