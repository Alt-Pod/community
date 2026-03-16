import { downloadFromStorage } from "./storageHelper";

const MAX_CONTENT_LENGTH = 100_000;

export async function extractFileContent(
  storageKey: string,
  mimeType: string
): Promise<{ content: string; truncated: boolean }> {
  if (mimeType.startsWith("image/")) {
    return { content: "", truncated: false };
  }

  const buffer = await downloadFromStorage(storageKey);
  let text: string;

  switch (mimeType) {
    case "text/plain":
    case "text/csv":
      text = buffer.toString("utf-8");
      break;

    case "application/pdf": {
      const { PDFParse } = await import("pdf-parse");
      const pdf = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await pdf.getText();
      text = result.text;
      break;
    }

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      break;
    }

    default:
      text = buffer.toString("utf-8");
      break;
  }

  const truncated = text.length > MAX_CONTENT_LENGTH;
  if (truncated) {
    text = text.slice(0, MAX_CONTENT_LENGTH);
  }

  return { content: text, truncated };
}
