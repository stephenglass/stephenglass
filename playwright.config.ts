import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against the production build (`astro preview`), so they see
 * exactly what GitHub Pages serves.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4322",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],

  webServer: {
    // --ignore-lock keeps preview in the foreground even when Astro detects
    // a coding agent (it would otherwise background itself and exit).
    command: "npm run build && npx astro preview --port 4322 --ignore-lock",
    url: "http://localhost:4322",
    reuseExistingServer: !process.env.CI,
  },
});
