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
  "club",
  "document",
  "eva",
  "of",
  "programme",
  "quels",
  "sont"
]);

export function searchChunks(
  chunks: PdfChunk[],
  query: string,
  limit = 5
): SearchResult[] {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return [];
  }

  return chunks
    .map((chunk) => {
      const text = `${chunk.title ?? ""} ${chunk.text}`;
      const tokens = tokenize(text);
      const tokenSet = new Set(tokens);
      const matches = queryTokens.filter((token) => tokenSet.has(token));
      const frequency = matches.reduce(
        (sum, token) => sum + tokens.filter((item) => item === token).length,
        0
      );
      const exactBoost = text
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr"))
        ? 2.4
        : 0;
      const matchRatio = matches.length / queryTokens.length;
      const score =
        matchRatio +
        frequency / Math.max(tokens.length, 1) +
        exactBoost;

      return { ...chunk, score, matchRatio };
    })
    .filter((result) => result.score > 0.18 && result.matchRatio >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function tokenize(value: string): string[] {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}
