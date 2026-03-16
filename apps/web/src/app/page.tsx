import { auth } from "@community/backend";
import { USER_ROLES } from "@community/shared";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import AppNavbar from "@/components/app-navbar";
import WeeklyPlanning from "@/components/weekly-planning";
import LiveMeetings from "@/components/live-meetings";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const t = await getTranslations("home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-primary via-surface-secondary to-accent-gold-pale/30">
      <AppNavbar />
      <main className="py-10" style={{ minHeight: "calc(100vh - 53px)" }}>
        <div className="w-full max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
              {t("title")}
            </h1>
            <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <Link
              href="/chat"
              className="group p-6 rounded-lg bg-surface-primary border border-border-subtle shadow-elevated hover:shadow-card hover:border-accent-gold-muted transition-all duration-150"
            >
              <h2 className="font-heading text-xl font-semibold text-text-primary group-hover:text-accent-gold transition-colors duration-150">
                {t("chat.title")}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t("chat.description")}
              </p>
            </Link>

            <Link
              href="/agents"
              className="group p-6 rounded-lg bg-surface-primary border border-border-subtle shadow-elevated hover:shadow-card hover:border-accent-gold-muted transition-all duration-150"
            >
              <h2 className="font-heading text-xl font-semibold text-text-primary group-hover:text-accent-gold transition-colors duration-150">
                {t("agents.title")}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t("agents.description")}
              </p>
            </Link>

            <Link
              href="/tools"
              className="group p-6 rounded-lg bg-surface-primary border border-border-subtle shadow-elevated hover:shadow-card hover:border-accent-gold-muted transition-all duration-150"
            >
              <h2 className="font-heading text-xl font-semibold text-text-primary group-hover:text-accent-gold transition-colors duration-150">
                {t("tools.title")}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t("tools.description")}
              </p>
            </Link>

            {session?.user?.role === USER_ROLES.ADMIN && (
              <Link
                href="/billing"
                className="group p-6 rounded-lg bg-surface-primary border border-border-subtle shadow-elevated hover:shadow-card hover:border-accent-gold-muted transition-all duration-150 md:col-span-2"
              >
                <h2 className="font-heading text-xl font-semibold text-text-primary group-hover:text-accent-gold transition-colors duration-150">
                  {t("billing.title")}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {t("billing.description")}
                </p>
              </Link>
            )}
          </div>

          <div className="rounded-lg bg-surface-primary border border-border-subtle shadow-elevated p-6 mb-6">
            <LiveMeetings />
          </div>

          <div className="rounded-lg bg-surface-primary border border-border-subtle shadow-elevated p-6">
            <WeeklyPlanning />
          </div>
        </div>
      </main>
    </div>
  );
}
