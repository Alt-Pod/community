import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: [
    "@community/ui",
    "@community/backend",
    "@community/ai",
    "@community/shared",
    "@community/i18n",
  ],
};

export default withNextIntl(nextConfig);
