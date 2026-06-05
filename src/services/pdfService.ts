import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PdfPageText } from "../types";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractPdfText(pdfUrl: string): Promise<PdfPageText[]> {
  const response = await fetch(pdfUrl);

  if (!response.ok) {
    throw new Error(`PDF introuvable: ${pdfUrl}`);
  }

  const data = await response.arrayBuffer();
  const document = await pdfjs.getDocument({ data }).promise;
  const pages: PdfPageText[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push({ page: pageNumber, text });
  }

  return pages;
}
