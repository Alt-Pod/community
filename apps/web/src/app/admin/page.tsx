"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button, Heading, LoadingIndicator, TextInput } from "@community/ui";
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUserPassword,
  useUpdateUserRole,
  useDeleteUser,
} from "@/requests/useAdmin";

export default function AdminPage() {
  const t = useTranslations("admin");
  const { data: session } = useSession();
  const { data: users = [], isLoading } = useAdminUsers();
  const createMutation = useCreateUser();
  const resetMutation = useUpdateUserPassword();
  const roleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");

  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function handleCreate() {
    createMutation.mutate(
      { email: createEmail, password: createPassword, name: createName || undefined },
      {
        onSuccess: () => {
          setShowCreate(false);
          setCreateEmail("");
          setCreatePassword("");
          setCreateName("");
        },
      }
    );
  }

  function handleResetPassword(userId: string) {
    resetMutation.mutate(
      { id: userId, password: resetPassword },
      {
        onSuccess: () => {
          setResetUserId(null);
          setResetPassword("");
          setResetSuccess(userId);
          setTimeout(() => setResetSuccess(null), 3000);
        },
      }
    );
  }

  function handleDelete(userId: string) {
    deleteMutation.mutate(userId, {
      onSuccess: () => setDeleteConfirmId(null),
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Heading as="h1" className="text-2xl">
          {t("title")}
        </Heading>
        <Button variant="secondary" onClick={() => setShowCreate(true)}>
          {t("createButton")}
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 p-5 border border-border-subtle rounded-md bg-surface-primary">
          <div className="space-y-3">
            <TextInput
              placeholder={t("form.emailPlaceholder")}
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
            />
            <TextInput
              type="password"
              placeholder={t("form.passwordPlaceholder")}
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
            />
            <TextInput
              placeholder={t("form.namePlaceholder")}
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
            {createMutation.error && (
              <p className="text-sm text-error">{createMutation.error.message}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setCreateEmail("");
                  setCreatePassword("");
                  setCreateName("");
                  createMutation.reset();
                }}
              >
                {t("form.cancel")}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !createEmail || !createPassword}
              >
                {createMutation.isPending ? t("form.creating") : t("form.create")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <LoadingIndicator variant="inline" text={t("loading")} />
      )}

      <div className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === session?.user?.id;

          return (
            <div
              key={user.id}
              className="p-5 border border-border-subtle rounded-md bg-surface-primary"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-semibold text-text-primary truncate">
                      {user.email}
                    </h3>
                    {isSelf ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-tertiary text-text-secondary shrink-0">
                        {user.role}
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          roleMutation.mutate({
                            id: user.id,
                            role: e.target.value,
                          })
                        }
                        disabled={roleMutation.isPending}
                        className="text-xs px-2 py-0.5 rounded-md border border-border-subtle bg-surface-secondary text-text-primary cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-gold"
                      >
                        <option value="user">{t("roleUser")}</option>
                        <option value="admin">{t("roleAdmin")}</option>
                      </select>
                    )}
                  </div>
                  {user.name && (
                    <p className="text-sm text-text-secondary mt-0.5">
                      {user.name}
                    </p>
                  )}
                  <p className="text-xs text-text-tertiary mt-1">
                    {t("createdAt")}{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setResetUserId(resetUserId === user.id ? null : user.id);
                      setResetPassword("");
                      resetMutation.reset();
                    }}
                  >
                    {t("resetPassword.button")}
                  </Button>
                  {!isSelf && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteConfirmId(user.id)}
                    >
                      {t("delete.button")}
                    </Button>
                  )}
                </div>
              </div>

              {resetSuccess === user.id && (
                <p className="text-sm text-accent-gold mt-3">
                  {t("resetPassword.success")}
                </p>
              )}

              {resetUserId === user.id && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <p className="text-sm font-medium text-text-primary mb-2">
                    {t("resetPassword.title")}
                  </p>
                  <div className="flex gap-2">
                    <TextInput
                      type="password"
                      placeholder={t("resetPassword.newPasswordPlaceholder")}
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleResetPassword(user.id)}
                      disabled={resetMutation.isPending || resetPassword.length < 8}
                    >
                      {resetMutation.isPending
                        ? t("resetPassword.submitting")
                        : t("resetPassword.submit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResetUserId(null);
                        setResetPassword("");
                        resetMutation.reset();
                      }}
                    >
                      {t("resetPassword.cancel")}
                    </Button>
                  </div>
                  {resetMutation.error && (
                    <p className="text-sm text-error mt-2">
                      {resetMutation.error.message}
                    </p>
                  )}
                </div>
              )}

              {deleteConfirmId === user.id && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <p className="text-sm text-text-primary mb-2">
                    {t("delete.confirm")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {t("delete.confirmButton")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      {t("delete.cancel")}
                    </Button>
                  </div>
                  {deleteMutation.error && (
                    <p className="text-sm text-error mt-2">
                      {deleteMutation.error.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!isLoading && users.length === 0 && (
          <p className="text-text-tertiary text-sm text-center py-8">
            {t("empty")}
          </p>
        )}
      </div>
    </div>
  );
}
