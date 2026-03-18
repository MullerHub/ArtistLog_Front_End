import { defineConfig, devices } from "@playwright/test";

const e2eHost = process.env.E2E_HOST || "127.0.0.1";
const e2ePort = Number(process.env.E2E_PORT || "5173");
const resolvedPort = Number.isNaN(e2ePort) ? 5173 : e2ePort;
const e2eBaseURL = process.env.E2E_BASE_URL || `http://${e2eHost}:${resolvedPort}`;
const shouldStartDevServer = !process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: "list",
  use: {
    baseURL: e2eBaseURL,
    trace: "on-first-retry",
    locale: "pt-BR",
  },
  webServer: shouldStartDevServer
    ? {
      command: `npm run dev -- --host ${e2eHost} --port ${resolvedPort}`,
      url: e2eBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
  ],
});
