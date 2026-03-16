"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, TextInput } from "@community/ui";
import { useChangePassword } from "@/requests/useProfile";

export default function ProfilePasswordForm() {
  const t = useTranslations("profile.password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const mutation = useChangePassword();

  useEffect(() => {
    if (mutation.isSuccess) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLocalError("");
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (newPassword.length < 8) {
      setLocalError(t("errorLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError(t("errorMismatch"));
      return;
    }

    mutation.mutate({ currentPassword, newPassword });
  };

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0;

  return (
    <section className="p-6 border border-border-subtle rounded-md bg-surface-primary">
      <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
        {t("title")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("current")}
          </label>
          <TextInput
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("new")}
          </label>
          <TextInput
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("confirm")}
          </label>
          <TextInput
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
          />
        </div>
        {localError && <p className="text-sm text-error">{localError}</p>}
        {mutation.isError && (
          <p className="text-sm text-error">{mutation.error.message}</p>
        )}
        {showSuccess && (
          <p className="text-sm text-accent-gold">{t("success")}</p>
        )}
        <Button type="submit" disabled={!canSubmit || mutation.isPending}>
          {mutation.isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </section>
  );
}
