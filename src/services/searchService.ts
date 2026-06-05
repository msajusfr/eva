import type { PdfChunk, SearchResult } from "../types";

const STOP_WORDS = new Set([
  "avec",
  "aux",
  "ces",
  "dans",
  "des",
  "donc",
  "elle",
  "est",
  "les",
  "leur",
  "mais",
  "par",
  "pas",
  "pour",
  "que",
  "qui",
  "sur",
  "une",
  "vous",
  "the",
  "and",
  "document",
  "lui",
  "moi",
  "of",
  "programme",
  "quel",
  "quelle",
  "quelles",
  "quels",
  "sont"
]);

const QUERY_EXPANSIONS: Record<string, string[]> = {
  cout: ["gratuit", "gratuite", "participation", "contribution", "engagement"],
  coute: ["gratuit", "gratuite", "participation", "contribution", "engagement"],
  prix: ["gratuit", "gratuite", "participation", "contribution", "engagement"],
  tarif: ["gratuit", "gratuite", "participation", "contribution", "engagement"],
  tarifs: ["gratuit", "gratuite", "participation", "contribution", "engagement"],
  presenter: ["structure", "ouverte", "reseau", "partenariat", "think", "tank"],
  presente: ["structure", "ouverte", "reseau", "partenariat", "think", "tank"],
  presentation: ["structure", "ouverte", "reseau", "partenariat", "think", "tank"],
  inscription: ["participation", "gratuite", "engagement", "assister"],
  inscriptions: ["participation", "gratuite", "engagement", "assister"],
  lieu: ["hoba", "rue", "bernard", "buffet", "paris"],
  adresse: ["hoba", "rue", "bernard", "buffet", "paris"],
  horaire: ["19h", "21h", "mardi", "jeudi", "frequence"],
  horaires: ["19h", "21h", "mardi", "jeudi", "frequence"],
  date: ["mai", "juin", "juillet", "septembre", "octobre", "novembre", "decembre", "janvier", "fevrier"],
  dates: ["mai", "juin", "juillet", "septembre", "octobre", "novembre", "decembre", "janvier", "fevrier"]
};

export function searchChunks(
  chunks: PdfChunk[],
  query: string,
  limit = 5
): SearchResult[] {
  const queryTokens = tokenize(query);
  const expandedTokens = expandTokens(queryTokens);

  if (queryTokens.length === 0) {
    return [];
  }

  return chunks
    .map((chunk) => {
      const text = `${chunk.title ?? ""} ${chunk.text}`;
      const tokens = tokenize(text);
      const tokenSet = new Set(tokens);
      const matches = queryTokens.filter((token) => tokenSet.has(token));
      const expandedMatches = expandedTokens.filter((token) => tokenSet.has(token));
      const frequency = matches.reduce(
        (sum, token) => sum + tokens.filter((item) => item === token).length,
        0
      );
      const expandedFrequency = expandedMatches.reduce(
        (sum, token) => sum + tokens.filter((item) => item === token).length,
        0
      );
      const exactBoost = text
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr"))
        ? 2.4
        : 0;
      const matchRatio = matches.length / queryTokens.length;
      const expandedRatio = expandedMatches.length / expandedTokens.length;
      const score =
        matchRatio * 1.6 +
        expandedRatio * 0.9 +
        frequency / Math.max(tokens.length, 1) +
        expandedFrequency / Math.max(tokens.length, 1) +
        exactBoost;

      return { ...chunk, score, matchRatio, expandedRatio };
    })
    .filter(
      (result) =>
        result.score > 0.14 &&
        (result.matchRatio > 0 || result.expandedRatio >= 0.18)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function tokenize(value: string): string[] {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/[^a-z0-9]+/i)
    .map(normalizePlural)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function expandTokens(tokens: string[]): string[] {
  return Array.from(
    new Set(
      tokens.flatMap((token) => [
        token,
        ...(QUERY_EXPANSIONS[token] ?? []).map(normalizePlural)
      ])
    )
  );
}

function normalizePlural(token: string): string {
  if (token.length > 4 && token.endsWith("s")) {
    return token.slice(0, -1);
  }

  return token;
}
