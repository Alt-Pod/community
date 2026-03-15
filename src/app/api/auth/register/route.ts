import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import sql from "@/lib/db";

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Registration is disabled" }, { status: 403 });
  }

  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  try {
    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) {
      return NextResponse.json({ message: "Registration processed" }, { status: 201 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name || null})
    `;

    return NextResponse.json({ message: "Registration processed" }, { status: 201 });
  } catch {
    console.error("Registration: database error");
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
