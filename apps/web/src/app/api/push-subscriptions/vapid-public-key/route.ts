export async function GET() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

  if (!vapidPublicKey) {
    return Response.json(
      { error: "Push notifications not configured" },
      { status: 503 }
    );
  }

  return Response.json({ vapidPublicKey });
}
