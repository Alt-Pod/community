export interface FileRecord {
  id: string;
  user_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  category: FileCategory;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type FileCategory =
  | "avatar"
  | "agent_avatar"
  | "chat_image"
  | "document"
  | "attachment";

export const FILE_CATEGORIES: FileCategory[] = [
  "avatar",
  "agent_avatar",
  "chat_image",
  "document",
  "attachment",
];

export const ALLOWED_MIME_TYPES = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  document: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
  ],
} as const;

export const MAX_FILE_SIZE = {
  image: 10 * 1024 * 1024, // 10 MB
  document: 25 * 1024 * 1024, // 25 MB
} as const;
