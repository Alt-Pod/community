"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, TextInput, Heading } from "@community/ui";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-primary via-surface-secondary to-accent-gold-pale/30">
      <div className="w-full max-w-sm space-y-6 bg-surface-primary shadow-card rounded-lg p-10">
        <Heading as="h1" className="text-center">{t("title")}</Heading>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            name="name"
            type="text"
            placeholder={t("namePlaceholder")}
          />
          <TextInput
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            required
          />
          <TextInput
            name="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? t("submitting") : t("submit")}
          </Button>
        </form>
        <p className="text-center text-sm text-text-tertiary">
          {t("hasAccount")}{" "}
          <a href="/login" className="text-accent-gold hover:text-accent-gold-light hover:underline">{t("loginLink")}</a>
        </p>
      </div>
    </main>
  );
}
