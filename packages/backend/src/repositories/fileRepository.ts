import type { Sql, JSONValue } from "postgres";
import type { FileRecord } from "@community/shared";

export class FileRepository {
  constructor(
    private sql: Sql,
    private table: string = "files"
  ) {}

  async findByUserId(userId: string): Promise<FileRecord[]> {
    return this.sql<FileRecord[]>`
      SELECT id, user_id, filename, mime_type, size_bytes, storage_key, category, metadata, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  async findByUserIdAndCategory(
    userId: string,
    category: string
  ): Promise<FileRecord[]> {
    return this.sql<FileRecord[]>`
      SELECT id, user_id, filename, mime_type, size_bytes, storage_key, category, metadata, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND category = ${category}
      ORDER BY created_at DESC
    `;
  }

  async findById(
    id: string,
    userId: string
  ): Promise<FileRecord | undefined> {
    const [file] = await this.sql<FileRecord[]>`
      SELECT id, user_id, filename, mime_type, size_bytes, storage_key, category, metadata, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return file;
  }

  async create(data: {
    userId: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    category: string;
    metadata?: Record<string, unknown>;
  }): Promise<FileRecord> {
    const [file] = await this.sql<FileRecord[]>`
      INSERT INTO ${this.sql(this.table)} (user_id, filename, mime_type, size_bytes, storage_key, category, metadata)
      VALUES (${data.userId}, ${data.filename}, ${data.mimeType}, ${data.sizeBytes}, ${data.storageKey}, ${data.category}, ${this.sql.json(data.metadata as JSONValue ?? {})})
      RETURNING *
    `;
    return file;
  }

  async updateMetadata(
    id: string,
    userId: string,
    metadata: Record<string, unknown>
  ): Promise<FileRecord | undefined> {
    const [file] = await this.sql<FileRecord[]>`
      UPDATE ${this.sql(this.table)}
      SET metadata = ${this.sql.json(metadata as JSONValue)}, updated_at = now()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return file;
  }

  async deleteById(
    id: string,
    userId: string
  ): Promise<FileRecord | undefined> {
    const [file] = await this.sql<FileRecord[]>`
      DELETE FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return file;
  }
}
