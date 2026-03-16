import type { Sql } from "postgres";

export class UserRepository {
  constructor(
    private sql: Sql,
    private table: string = "users"
  ) {}

  async findByEmail(email: string) {
    const [user] = await this.sql`
      SELECT * FROM ${this.sql(this.table)} WHERE email = ${email}
    `;
    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await this.sql`
      SELECT * FROM ${this.sql(this.table)} WHERE id = ${id}
    `;
    return user ?? null;
  }

  async findProfileById(id: string) {
    const [user] = await this.sql`
      SELECT id, email, name, avatar_url, timezone, lang, created_at
      FROM ${this.sql(this.table)} WHERE id = ${id}
    `;
    return user ?? null;
  }

  async updateProfile(id: string, data: { name?: string; email?: string; timezone?: string; lang?: string }) {
    const [user] = await this.sql`
      UPDATE ${this.sql(this.table)}
      SET name = COALESCE(${data.name ?? null}, name),
          email = COALESCE(${data.email ?? null}, email),
          timezone = COALESCE(${data.timezone ?? null}, timezone),
          lang = COALESCE(${data.lang ?? null}, lang)
      WHERE id = ${id}
      RETURNING id, email, name, avatar_url, timezone, lang, created_at
    `;
    return user ?? null;
  }

  async updateAvatarUrl(id: string, avatarUrl: string | null) {
    const [user] = await this.sql`
      UPDATE ${this.sql(this.table)}
      SET avatar_url = ${avatarUrl}
      WHERE id = ${id}
      RETURNING id, email, name, avatar_url, timezone, lang, created_at
    `;
    return user ?? null;
  }

  async findPasswordHashById(id: string) {
    const [row] = await this.sql`
      SELECT password_hash FROM ${this.sql(this.table)} WHERE id = ${id}
    `;
    return row?.password_hash ?? null;
  }

  async updatePasswordHash(id: string, hash: string) {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET password_hash = ${hash}
      WHERE id = ${id}
    `;
  }

  async updateRole(id: string, role: string) {
    const [user] = await this.sql`
      UPDATE ${this.sql(this.table)}
      SET role = ${role}
      WHERE id = ${id}
      RETURNING id, email, name, role, created_at
    `;
    return user ?? null;
  }

  async findAll() {
    return this.sql`
      SELECT id, email, name, role, created_at
      FROM ${this.sql(this.table)}
      ORDER BY created_at DESC
    `;
  }

  async deleteById(id: string) {
    const [deleted] = await this.sql`
      DELETE FROM ${this.sql(this.table)}
      WHERE id = ${id}
      RETURNING id
    `;
    return deleted ?? null;
  }

  async create(data: { email: string; passwordHash: string; name?: string | null }) {
    const [user] = await this.sql`
      INSERT INTO ${this.sql(this.table)} (email, password_hash, name)
      VALUES (${data.email}, ${data.passwordHash}, ${data.name ?? null})
      RETURNING id, email, name, role, created_at
    `;
    return user;
  }
}
