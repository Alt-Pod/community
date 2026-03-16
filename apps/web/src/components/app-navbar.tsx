"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { Navbar } from "@community/ui";
import { USER_ROLES } from "@community/shared";

export default function AppNavbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();

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
      href: "/planning",
      label: t("planning"),
      active: pathname.startsWith("/planning"),
    },
    ...(session?.user?.role === USER_ROLES.ADMIN
      ? [
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
      right={
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-sm transition-colors duration-150"
        >
          {t("logout")}
        </button>
      }
    />
  );
}
