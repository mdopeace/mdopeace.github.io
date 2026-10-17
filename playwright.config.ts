import { defineConfig } from "@playwright/test";

// Serves the repo root, because the site is now a single index.html with no
// build step. What the tests assert is exactly what GitHub Pages would serve.
export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npx --yes serve . -l 3000",
    url: "http://localhost:3000/index.html",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: { baseURL: "http://localhost:3000" },
});
