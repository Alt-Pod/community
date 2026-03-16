import type { UserProfile } from "@community/shared";

export type ProfileResponse = UserProfile & { avatar_signed_url: string | null };

export async function fetchProfile(): Promise<ProfileResponse> {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(
  data: { name?: string; email?: string }
): Promise<ProfileResponse> {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to update profile");
  }
  return res.json();
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch("/api/profile/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to change password");
  }
}

export async function uploadAvatar(file: File): Promise<ProfileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/profile/avatar", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to upload avatar");
  }
  return res.json();
}

export async function deleteAvatar(): Promise<void> {
  const res = await fetch("/api/profile/avatar", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete avatar");
}
