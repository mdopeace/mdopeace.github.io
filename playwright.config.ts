import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

// Match `next build`: read .env.production unless the variable is already set (even empty).
loadEnvConfig(process.cwd(), false);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:3003", reducedMotion: "reduce" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "npm run start -- --listen 3003",
    url: "http://localhost:3003",
    reuseExistingServer: !process.env.CI,
  },
});
