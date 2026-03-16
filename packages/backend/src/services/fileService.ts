import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@community/shared";
import type { FileCategory, FileRecord } from "@community/shared";
import type { FileRepository } from "../repositories/fileRepository";
import {
  uploadToStorage,
  deleteFromStorage,
  getSignedUrl,
} from "../helpers/storageHelper";

export type FileWithUrl = FileRecord & { url: string };

function getFileType(mimeType: string): "image" | "document" | null {
  if ((ALLOWED_MIME_TYPES.image as readonly string[]).includes(mimeType))
    return "image";
  if ((ALLOWED_MIME_TYPES.document as readonly string[]).includes(mimeType))
    return "document";
  return null;
}

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()! : "bin";
}

async function enrichWithUrl(file: FileRecord): Promise<FileWithUrl> {
  const url = await getSignedUrl(file.storage_key);
  return { ...file, url };
}

export class FileService {
  constructor(private fileRepository: FileRepository) {}

  async listFiles(
    userId: string,
    filters?: { category?: string }
  ): Promise<FileWithUrl[]> {
    const files = filters?.category
      ? await this.fileRepository.findByUserIdAndCategory(
          userId,
          filters.category
        )
      : await this.fileRepository.findByUserId(userId);

    return Promise.all(files.map(enrichWithUrl));
  }

  async getFile(id: string, userId: string): Promise<FileWithUrl | null> {
    const file = await this.fileRepository.findById(id, userId);
    if (!file) return null;
    return enrichWithUrl(file);
  }

  async uploadFile(
    userId: string,
    data: {
      buffer: Buffer;
      filename: string;
      mimeType: string;
      category: FileCategory;
      metadata?: Record<string, unknown>;
    }
  ): Promise<FileWithUrl> {
    const fileType = getFileType(data.mimeType);
    if (!fileType) {
      throw new Error(`Unsupported file type: ${data.mimeType}`);
    }

    const maxSize = MAX_FILE_SIZE[fileType];
    if (data.buffer.byteLength > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      throw new Error(
        `File too large. Maximum size for ${fileType}s is ${maxMB}MB.`
      );
    }

    const ext = getExtension(data.filename);
    const storageKey = `users/${userId}/${data.category}/${crypto.randomUUID()}.${ext}`;

    await uploadToStorage(storageKey, data.buffer, data.mimeType);

    const file = await this.fileRepository.create({
      userId,
      filename: data.filename,
      mimeType: data.mimeType,
      sizeBytes: data.buffer.byteLength,
      storageKey,
      category: data.category,
      metadata: data.metadata,
    });

    return enrichWithUrl(file);
  }

  async updateFileMetadata(
    id: string,
    userId: string,
    metadata: Record<string, unknown>
  ): Promise<FileWithUrl | null> {
    const file = await this.fileRepository.updateMetadata(id, userId, metadata);
    if (!file) return null;
    return enrichWithUrl(file);
  }

  async deleteFile(id: string, userId: string): Promise<boolean> {
    const file = await this.fileRepository.deleteById(id, userId);
    if (!file) return false;
    await deleteFromStorage(file.storage_key);
    return true;
  }
}
