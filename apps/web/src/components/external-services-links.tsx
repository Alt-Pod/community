"use client";

interface ExternalServicesLinksProps {
  t: (key: string) => string;
}

const SERVICES = [
  {
    key: "neonDashboard",
    url: "https://console.neon.tech",
  },
  {
    key: "vercelDashboard",
    url: "https://vercel.com/dashboard",
  },
  {
    key: "inngestDashboard",
    url: "https://app.inngest.com",
  },
  {
    key: "googleCloudDashboard",
    url: "https://console.cloud.google.com/billing",
  },
  {
    key: "cloudflareR2Dashboard",
    url: "https://dash.cloudflare.com/?to=/:account/r2",
  },
];

export default function ExternalServicesLinks({
  t,
}: ExternalServicesLinksProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {SERVICES.map((svc) => (
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
