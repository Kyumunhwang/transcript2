import { extractText } from 'unpdf';

export interface ExtractedPdfContent {
  totalPages: number;
  fullText: string;
  lines: string[];
}

/**
 * Extracts raw text and cleaned line-by-line tokens from a PDF binary.
 * Uses unpdf for serverless/Node.js native compatibility without binary conflicts. (ADR-001)
 */
export async function extractTextFromPdf(
  data: ArrayBuffer | Uint8Array
): Promise<ExtractedPdfContent> {
  const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);

  console.log(`[PDF Extractor] Processing binary data of byteLength: ${uint8Data.byteLength}`);

  const result = await extractText(uint8Data, { mergePages: true });

  const fullText = (typeof result.text === 'string' ? result.text : (result.text as string[]).join('\n')) || '';

  console.log(`[PDF Extractor] totalPages: ${result.totalPages}, fullText length: ${fullText.length}`);

  // Split lines by newline or carriage return
  let lines = fullText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // If text was merged on single lines without standard \n, split by multiple spaces or tabs
  if (lines.length <= 1 && fullText.length > 0) {
    lines = fullText
      .split(/\s{2,}|\t/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  console.log(`[PDF Extractor] Resulting parsed lines count: ${lines.length}`);
  if (lines.length > 0) {
    console.log(`[PDF Extractor] Preview lines:\n${lines.slice(0, 5).join(' | ')}`);
  }

  return {
    totalPages: result.totalPages,
    fullText,
    lines,
  };
}
