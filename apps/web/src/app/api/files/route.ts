import { auth, fileService } from "@community/backend";
import type { FileCategory } from "@community/shared";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;

  const files = await fileService.listFiles(session.user.id, { category });
  return Response.json(files);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as FileCategory) ?? "attachment";
  const metadataRaw = formData.get("metadata") as string | null;

  if (!file) {
    return Response.json({ error: "File is required" }, { status: 400 });
  }

  const metadata = metadataRaw ? JSON.parse(metadataRaw) : undefined;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await fileService.uploadFile(session.user.id, {
      buffer,
      filename: file.name,
      mimeType: file.type,
      category,
      metadata,
    });
    return Response.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
