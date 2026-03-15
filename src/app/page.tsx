import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Community</h1>
        <p className="text-gray-400">Welcome, {session.user?.name || session.user?.email}</p>
      </div>
    </main>
  );
}
