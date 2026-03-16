import { NextResponse } from "next/server";
import { auth, userService } from "@community/backend";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const profile = await userService.uploadAvatar(
      session.user.id,
      buffer,
      file.type,
      file.name
    );
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "INVALID_FILE_TYPE") {
        return NextResponse.json(
          { error: "Invalid file type. Use JPG, PNG, GIF, or WebP." },
          { status: 400 }
        );
      }
      if (err.message === "FILE_TOO_LARGE") {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await userService.deleteAvatar(session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}
