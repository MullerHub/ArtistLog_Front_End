import type { Page } from "@playwright/test";

interface SeedUserOptions {
  id?: string;
  email?: string;
  role?: "ARTIST" | "VENUE";
}

function resolveNotificationsRoutePattern(): string {
  const apiBase = (process.env.E2E_API_URL || process.env.VITE_API_URL || "").replace(/\/+$/, "");
  return apiBase ? `${apiBase}/notifications**` : "**/notifications**";
}

export async function seedAuthenticatedUser(page: Page, options: SeedUserOptions = {}): Promise<void> {
  const user = {
    id: options.id || "user-e2e-1",
    email: options.email || "artist@artistlog.com",
    role: options.role || "ARTIST",
    created_at: "2026-03-14T00:00:00Z",
    updated_at: "2026-03-14T00:00:00Z",
  };

  await page.route("**/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

  await page.addInitScript((seedUser) => {
    localStorage.setItem("artistlog_user", JSON.stringify(seedUser));
    localStorage.setItem("artistlog_token", "e2e-token");
    localStorage.setItem("artistlog_lang", "pt-BR");
  }, user);
}

export async function mockNotificationFeed(page: Page): Promise<void> {
  await page.route(resolveNotificationsRoutePattern(), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}
