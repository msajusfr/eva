import type { PdfChunk, PdfPageText } from "../types";

const TARGET_SIZE = 760;
const OVERLAP = 140;

export function createChunks(pages: PdfPageText[]): PdfChunk[] {
  return pages.flatMap((page) => chunkPage(page));
}

function chunkPage(page: PdfPageText): PdfChunk[] {
  const normalized = page.text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const title = inferTitle(normalized);
  const chunks: PdfChunk[] = [];
  let cursor = 0;
  let index = 1;

  while (cursor < normalized.length) {
    const start = findChunkStart(normalized, cursor);
    const end = findChunkEnd(normalized, cursor + TARGET_SIZE);
    const text = normalized.slice(start, end).trim();

    if (text.length > 80) {
      chunks.push({
        id: `page-${page.page}-chunk-${index}`,
        page: page.page,
        title,
        text
      });
      index += 1;
    }

    if (end >= normalized.length) {
      break;
    }

    cursor = Math.max(0, end - OVERLAP);
  }

  return chunks;
}

function findChunkStart(text: string, cursor: number): number {
  if (cursor === 0) {
    return 0;
  }

  const nextSpace = text.indexOf(" ", cursor);
  return nextSpace > -1 ? nextSpace + 1 : cursor;
}

function findChunkEnd(text: string, desiredEnd: number): number {
  if (desiredEnd >= text.length) {
    return text.length;
  }

  const punctuation = [". ", "? ", "! ", "; ", ": "];
  const candidates = punctuation
    .map((mark) => text.lastIndexOf(mark, desiredEnd))
    .filter((index) => index > desiredEnd - 220);

  if (candidates.length > 0) {
    return Math.max(...candidates) + 1;
  }

  const space = text.lastIndexOf(" ", desiredEnd);
  return space > 0 ? space : desiredEnd;
}

function inferTitle(text: string): string | undefined {
  const firstSlice = text.slice(0, 120);
  const compact = firstSlice.split(/[.!?]/)[0]?.trim();

  if (!compact || compact.length > 70) {
    return undefined;
  }

  return compact;
}
