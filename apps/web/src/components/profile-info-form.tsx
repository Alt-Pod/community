"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, TextInput } from "@community/ui";
import { useUpdateProfile } from "@/requests/useProfile";

interface ProfileInfoFormProps {
  initialName: string;
  initialEmail: string;
}

export default function ProfileInfoForm({
  initialName,
  initialEmail,
}: ProfileInfoFormProps) {
  const t = useTranslations("profile.info");
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const mutation = useUpdateProfile();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
  }, [initialName, initialEmail]);

  useEffect(() => {
    if (mutation.isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, email });
  };

  const hasChanges = name !== initialName || email !== initialEmail;

  return (
    <section className="p-6 border border-border-subtle rounded-md bg-surface-primary">
      <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
        {t("title")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("name")}
          </label>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("email")}
          </label>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
          />
        </div>
        {mutation.isError && (
          <p className="text-sm text-error">{mutation.error.message}</p>
        )}
        {showSuccess && (
          <p className="text-sm text-accent-gold">{t("saved")}</p>
        )}
        <Button type="submit" disabled={!hasChanges || mutation.isPending}>
          {mutation.isPending ? t("saving") : t("save")}
        </Button>
      </form>
    </section>
  );
}
