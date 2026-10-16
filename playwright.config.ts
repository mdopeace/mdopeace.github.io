import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npx serve out -l 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: { baseURL: "http://localhost:3000" },
});