// Playwright config for tests/forms.spec.mjs. Serves the repo root (the built,
// committed site) on a local port so the test exercises dist/app.js as deployed.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    // Optional: point at an existing Chromium instead of `npm run test:install`.
    ...(process.env.CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } } : {}),
  },
  webServer: {
    command: "node scripts/serve.mjs 4173",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: !process.env.CI,
    timeout: 20000,
  },
});
