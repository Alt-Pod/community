export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  timezone: string;
  lang: string;
  created_at: string;
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/admin/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<AdminUser> {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to create user");
  }
  return res.json();
}

export async function updateUserPassword(
  id: string,
  password: string
): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to update password");
  }
}

export async function updateUserRole(
  id: string,
  role: string
): Promise<AdminUser> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to update role");
  }
  return res.json();
}

export async function updateUserPreferences(
  id: string,
  data: { timezone?: string; lang?: string }
): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to update preferences");
  }
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to delete user");
  }
}
