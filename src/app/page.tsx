import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatPanel from "@/components/chat-panel";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <ChatPanel />;
}
