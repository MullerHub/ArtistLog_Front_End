import { test, expect } from "@playwright/test";
import { mockNotificationFeed, seedAuthenticatedUser } from "./helpers/session";

test.describe("Contracts Page", () => {
  test("renders contracts list from API", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST", email: "artist@artistlog.com" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/contracts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "c1",
            title: "Show Sexta Premium",
            status: "PENDING",
            artist_id: "a1",
            artist_name: "DJ Aurora",
            venue_id: "v1",
            venue_name: "Casa da Lapa",
            event_date: "2026-03-21T00:00:00Z",
            event_type: "Balada",
            final_price: 2800,
            description: "Set de 2h",
            created_at: "2026-03-10T00:00:00Z",
            updated_at: "2026-03-11T00:00:00Z",
          },
        ]),
      });
    });

    await page.goto("/contracts");

    await expect(page.locator("h1", { hasText: "Contratos" })).toBeVisible();
    await expect(page.getByText("Show Sexta Premium")).toBeVisible();
    await expect(page.getByText("DJ Aurora → Casa da Lapa")).toBeVisible();
  });
});
