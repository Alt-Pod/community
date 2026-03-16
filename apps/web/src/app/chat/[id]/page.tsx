import { auth } from "@community/backend";
import { redirect } from "next/navigation";
import ChatPanel from "@/components/chat-panel";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return <ChatPanel conversationId={id} />;
}
