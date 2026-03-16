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
      SELECT id, email, name, created_at
      FROM ${this.sql(this.table)} WHERE id = ${id}
    `;
    return user ?? null;
  }

  async create(data: { email: string; passwordHash: string; name?: string | null }) {
    const [user] = await this.sql`
      INSERT INTO ${this.sql(this.table)} (email, password_hash, name)
      VALUES (${data.email}, ${data.passwordHash}, ${data.name ?? null})
      RETURNING *
    `;
    return user;
  }
}
