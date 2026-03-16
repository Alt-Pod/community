import type { FileRecord, FileCategory } from "@community/shared";

export type FileRecordWithUrl = FileRecord & { url: string };

export async function fetchFiles(
  category?: string
): Promise<FileRecordWithUrl[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`/api/files${params}`);
  if (!res.ok) throw new Error("Failed to fetch files");
  return res.json();
}

export async function fetchFile(id: string): Promise<FileRecordWithUrl> {
  const res = await fetch(`/api/files/${id}`);
  if (!res.ok) throw new Error("Failed to fetch file");
  return res.json();
}

export async function uploadFile(
  file: File,
  category: FileCategory,
  metadata?: Record<string, unknown>
): Promise<FileRecordWithUrl> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata));
  }
  const res = await fetch("/api/files", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}

export async function updateFileMetadata(
  id: string,
  metadata: Record<string, unknown>
): Promise<FileRecordWithUrl> {
  const res = await fetch(`/api/files/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metadata }),
  });
  if (!res.ok) throw new Error("Failed to update file");
  return res.json();
}

export async function deleteFile(id: string): Promise<void> {
  const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete file");
}
