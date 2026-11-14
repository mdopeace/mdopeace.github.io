import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // A custom page extension makes the local showcase absent from production.
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
