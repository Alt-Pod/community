"use client";

import { useTranslations } from "next-intl";
import { Heading, LoadingIndicator } from "@community/ui";
import { useProfile } from "@/requests/useProfile";
import AppNavbar from "@/components/app-navbar";
import ProfileAvatar from "@/components/profile-avatar";
import ProfileInfoForm from "@/components/profile-info-form";
import ProfilePasswordForm from "@/components/profile-password-form";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="min-h-screen bg-surface-primary">
      <AppNavbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Heading as="h1" className="text-2xl">
            {t("title")}
          </Heading>
          <p className="text-text-secondary text-sm mt-1">{t("subtitle")}</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingIndicator />
          </div>
        )}

        {profile && (
          <div className="space-y-8">
            <ProfileAvatar
              name={profile.name}
              email={profile.email}
              avatarUrl={profile.avatar_signed_url}
            />
            <ProfileInfoForm
              initialName={profile.name ?? ""}
              initialEmail={profile.email}
            />
            <ProfilePasswordForm />
          </div>
        )}
      </div>
    </div>
  );
}
