"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Navbar } from "@community/ui";

export default function AppNavbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

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
  ];

  return (
    <Navbar
      brand="Community"
      links={links}
      linkComponent={Link}
    />
  );
}
