import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GA_MEASUREMENT_ID } from "./components/analytics/config";

const root = path.dirname(fileURLToPath(import.meta.url));
const disabledAnalytics = path.join(root, "components/analytics/disabled.ts");

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
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
  webpack: (config) => {
    if (!GA_MEASUREMENT_ID) {
      config.resolve ??= {};
      const alias = (config.resolve.alias && !Array.isArray(config.resolve.alias) && typeof config.resolve.alias === "object")
        ? config.resolve.alias
        : (config.resolve.alias = {});
      // Next resolves `@/` before this hook, so alias every likely specifier.
      for (const specifier of [
        "@/components/analytics/scheduleAnalytics",
        path.join(root, "components/analytics/scheduleAnalytics"),
        path.join(root, "components/analytics/scheduleAnalytics.ts"),
        path.join(root, "components/analytics/scheduleAnalytics.js"),
      ]) {
        alias[specifier] = disabledAnalytics;
      }
    }
    return config;
  },
};

export default nextConfig;
