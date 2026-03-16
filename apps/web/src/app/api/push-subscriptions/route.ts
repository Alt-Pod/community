import { auth, pushSubscriptionRepository } from "@community/backend";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { endpoint, keys, userAgent } = (await req.json()) as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return Response.json(
      { error: "Invalid push subscription" },
      { status: 400 }
    );
  }

  const sub = await pushSubscriptionRepository.upsert({
    userId: session.user.id,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent: userAgent ?? null,
  });

  return Response.json(sub, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { endpoint } = (await req.json()) as { endpoint: string };

  if (!endpoint) {
    return Response.json({ error: "Endpoint is required" }, { status: 400 });
  }

  await pushSubscriptionRepository.deleteByEndpoint(endpoint);
  return new Response(null, { status: 204 });
}
