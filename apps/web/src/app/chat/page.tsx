import { auth } from "@community/backend";
import { redirect } from "next/navigation";
import ChatPanel from "@/components/chat-panel";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <ChatPanel />;
}
