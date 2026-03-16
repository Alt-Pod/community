"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Select } from "@community/ui";
import { useUpdateProfile } from "@/requests/useProfile";

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "Europe/Rome", label: "Europe/Rome" },
  { value: "Europe/Madrid", label: "Europe/Madrid" },
  { value: "America/New_York", label: "America/New York" },
  { value: "America/Chicago", label: "America/Chicago" },
  { value: "America/Denver", label: "America/Denver" },
  { value: "America/Los_Angeles", label: "America/Los Angeles" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
  { value: "de", label: "Deutsch" },
];

interface ProfilePreferencesFormProps {
  initialTimezone: string;
  initialLang: string;
}

export default function ProfilePreferencesForm({
  initialTimezone,
  initialLang,
}: ProfilePreferencesFormProps) {
  const t = useTranslations("profile.preferences");
  const [timezone, setTimezone] = useState(initialTimezone);
  const [lang, setLang] = useState(initialLang);
  const mutation = useUpdateProfile();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setTimezone(initialTimezone);
    setLang(initialLang);
  }, [initialTimezone, initialLang]);

  useEffect(() => {
    if (mutation.isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ timezone, lang });
  };

  const hasChanges = timezone !== initialTimezone || lang !== initialLang;

  return (
    <section className="p-6 border border-border-subtle rounded-md bg-surface-primary">
      <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
        {t("title")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("timezone")}
          </label>
          <Select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            options={TIMEZONE_OPTIONS}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            {t("language")}
          </label>
          <Select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            options={LANGUAGE_OPTIONS}
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
