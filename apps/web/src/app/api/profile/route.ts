import { NextResponse } from "next/server";
import { auth, userService } from "@community/backend";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await userService.getProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, timezone, lang } = await req.json();

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
  }

  try {
    const profile = await userService.updateProfile(session.user.id, {
      name,
      email,
      timezone,
      lang,
    });
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EMAIL_TAKEN") {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      if (err.message === "INVALID_TIMEZONE") {
        return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
      }
      if (err.message === "INVALID_LANG") {
        return NextResponse.json({ error: "Invalid language" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
