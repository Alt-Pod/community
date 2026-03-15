"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

if (process.env.NODE_ENV !== "development") {
  throw new Error("Registration is disabled in production");
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
    } else {
      router.push("/login");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm space-y-6 p-8">
        <h1 className="text-2xl font-bold text-white text-center">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="w-full rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 8 characters)"
            required
            minLength={8}
            className="w-full rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">Sign in</a>
        </p>
      </div>
    </main>
  );
}
