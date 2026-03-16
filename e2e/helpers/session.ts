import type { Page } from "@playwright/test";

interface SeedUserOptions {
  id?: string;
  email?: string;
  role?: "ARTIST" | "VENUE";
}

export async function seedAuthenticatedUser(page: Page, options: SeedUserOptions = {}): Promise<void> {
  const user = {
    id: options.id || "user-e2e-1",
    email: options.email || "artist@artistlog.com",
    role: options.role || "ARTIST",
    created_at: "2026-03-14T00:00:00Z",
  };

  await page.addInitScript((seedUser) => {
    localStorage.setItem("artistlog_user", JSON.stringify(seedUser));
  }, user);
}

export async function mockNotificationFeed(page: Page): Promise<void> {
  await page.route("**://localhost:8080/notifications**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}
