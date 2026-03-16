"use client";

interface ExternalServicesLinksProps {
  t: (key: string) => string;
}

function getServices() {
  return [
    {
      key: "neonDashboard",
      url: process.env.NEXT_PUBLIC_BILLING_URL_NEON ?? "",
    },
    {
      key: "vercelDashboard",
      url: process.env.NEXT_PUBLIC_BILLING_URL_VERCEL ?? "",
    },
    {
      key: "inngestDashboard",
      url: process.env.NEXT_PUBLIC_BILLING_URL_INNGEST ?? "",
    },
    {
      key: "googleAiStudioDashboard",
      url: process.env.NEXT_PUBLIC_BILLING_URL_GOOGLE_AI_STUDIO ?? "",
    },
    {
      key: "cloudflareR2Dashboard",
      url: process.env.NEXT_PUBLIC_BILLING_URL_CLOUDFLARE ?? "",
    },
  ].filter((svc) => svc.url);
}

export default function ExternalServicesLinks({
  t,
}: ExternalServicesLinksProps) {
  const services = getServices();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {services.map((svc) => (
        <a
          key={svc.key}
          href={svc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border border-border-subtle rounded-md bg-surface-primary hover:border-accent-gold-muted hover:shadow-card transition-all duration-150"
        >
          <span className="text-sm font-medium text-text-primary">
            {t(svc.key)}
          </span>
          <span className="text-text-tertiary text-sm">↗</span>
        </a>
      ))}
    </div>
  );
}
