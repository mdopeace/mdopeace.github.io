import type { NextConfig } from "next";
import { GA_MEASUREMENT_ID } from "./components/analytics/config";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@mdopeace/ui"],
  // Directory indexes allow direct visits on GitHub Pages without rewrites.
  trailingSlash: true,
  // Keep the old preview address as a development-only compatibility route.
  pageExtensions:
    process.env.NODE_ENV === "development"
      ? ["tsx", "ts", "dev.tsx"]
      : ["tsx", "ts"],
  turbopack: {
    // Omit the Google tag loader entirely from the default static export.
    resolveAlias: GA_MEASUREMENT_ID
      ? {}
      : {
          "@/components/analytics/scheduleAnalytics": "./components/analytics/disabled.ts",
        },
    rules: {
      // Only the Tailwind entry needs this loader. Applying it to *.module.css
      // would turn modules into plain CSS and discard their class exports.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
