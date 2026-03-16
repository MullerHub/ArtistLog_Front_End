import { test, expect } from "@playwright/test";
import { mockNotificationFeed, seedAuthenticatedUser } from "./helpers/session";

test.describe("Artists Page", () => {
  test("renders artists list from API", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "VENUE", email: "venue@artistlog.com" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/artists?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            user_id: "a1",
            stage_name: "DJ Aurora",
            genres: ["House", "Techno"],
            tags: ["Balada"],
            city: "Sao Paulo",
            state: "SP",
            cache_base: 2200,
            rating: 4.9,
            review_count: 31,
            is_available: true,
            created_at: "2026-03-14T00:00:00Z",
          },
        ]),
      });
    });

    await page.goto("/artists");

    await expect(page.locator("h1", { hasText: "Artistas" })).toBeVisible();
    await expect(page.getByText("DJ Aurora")).toBeVisible();
    await expect(page.getByText("Sao Paulo, SP")).toBeVisible();
  });
});
