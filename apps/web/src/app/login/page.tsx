"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, TextInput, Heading } from "@community/ui";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("error"));
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-primary via-surface-secondary to-accent-gold-pale/30">
      <div className="w-full max-w-sm space-y-6 bg-surface-primary shadow-card rounded-lg p-10">
        <Heading as="h1" className="text-center">{t("title")}</Heading>
        <form onSubmit={handleSubmit} className="space-y-4">
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
        {process.env.NODE_ENV === "development" && (
          <p className="text-center text-sm text-text-tertiary">
            {t("noAccount")}{" "}
            <a href="/register" className="text-accent-gold hover:text-accent-gold-light hover:underline">{t("registerLink")}</a>
          </p>
        )}
      </div>
    </main>
  );
}
