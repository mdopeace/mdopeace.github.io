import type { NextConfig } from "next";

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
