"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { Navbar } from "@community/ui";
import { USER_ROLES } from "@community/shared";
import { useProfile } from "@/requests/useProfile";
import NotificationBadge from "./notification-badge";

function NavbarAvatar() {
  const { data: profile } = useProfile();
  const { data: session } = useSession();

  const name = profile?.name ?? session?.user?.name;
  const email = profile?.email ?? session?.user?.email ?? "";
  const avatarUrl = profile?.avatar_signed_url;

  const initials = name
    ? name
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email[0]?.toUpperCase() ?? "?";

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-surface-tertiary transition-colors duration-150"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-7 h-7 rounded-full object-cover border border-border-subtle"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-accent-gold-pale flex items-center justify-center border border-border-subtle">
          <span className="text-xs font-semibold text-accent-gold">
            {initials}
          </span>
        </div>
      )}
    </Link>
  );
}

export default function AppNavbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const links = [
    {
      href: "/chat",
      label: t("chat"),
      active: pathname.startsWith("/chat"),
    },
    {
      href: "/agents",
      label: t("agents"),
      active: pathname.startsWith("/agents"),
    },
    {
      href: "/tools",
      label: t("tools"),
      active: pathname.startsWith("/tools"),
    },
    {
      href: "/meetings",
      label: t("meetings"),
      active: pathname.startsWith("/meetings"),
    },
    {
      href: "/planning",
      label: t("planning"),
      active: pathname.startsWith("/planning"),
    },
    {
      href: "/logs",
      label: t("logs"),
      active: pathname.startsWith("/logs"),
    },
    ...(session?.user?.role === USER_ROLES.ADMIN
      ? [
          {
            href: "/admin",
            label: t("admin"),
            active: pathname.startsWith("/admin"),
          },
          {
            href: "/billing",
            label: t("billing"),
            active: pathname.startsWith("/billing"),
          },
        ]
      : []),
  ];

  return (
    <Navbar
      brand="Community"
      links={links}
      linkComponent={Link}
      mobileMenuOpen={mobileMenuOpen}
      onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
      menuOpenLabel={t("menuOpen")}
      menuCloseLabel={t("menuClose")}
      right={
        <div className="flex items-center gap-2">
          <NotificationBadge />
          <NavbarAvatar />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-sm transition-colors duration-150"
          >
            {t("logout")}
          </button>
        </div>
      }
    />
  );
}
