import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  esbuild: { jsx: "automatic" },
  test: {
    css: { include: /(?:ui|sticker)\.module\.css$/ },
    environment: "jsdom",
    include: ["tests/ui.test.tsx", "tests/analytics-consent.test.tsx"],
    setupFiles: ["./tests/setup.ts"],
  },
});
