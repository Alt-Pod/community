"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@community/ui";
import { useUploadAvatar, useDeleteAvatar } from "@/requests/useProfile";

interface ProfileAvatarProps {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email[0].toUpperCase();
}

export default function ProfileAvatar({
  name,
  email,
  avatarUrl,
}: ProfileAvatarProps) {
  const t = useTranslations("profile.avatar");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAvatar();
  const deleteMutation = useDeleteAvatar();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  return (
    <section className="p-6 border border-border-subtle rounded-md bg-surface-primary">
      <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
        {t("title")}
      </h2>
      <div className="flex items-center gap-6">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border border-border-subtle"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-accent-gold-pale flex items-center justify-center border border-border-subtle">
            <span className="text-2xl font-semibold text-accent-gold">
              {getInitials(name, email)}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending
              ? t("uploading")
              : avatarUrl
                ? t("change")
                : t("upload")}
          </Button>
          {avatarUrl && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {t("remove")}
            </Button>
          )}
          <p className="text-xs text-text-tertiary">{t("maxSize")}</p>
          {uploadMutation.isError && (
            <p className="text-sm text-error">{uploadMutation.error.message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
