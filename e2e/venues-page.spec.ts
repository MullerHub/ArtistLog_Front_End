import { test, expect } from "@playwright/test";
import { mockNotificationFeed, seedAuthenticatedUser } from "./helpers/session";

test.describe("Venues Page", () => {
  test("renders venues list from API", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST", email: "artist@artistlog.com" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/venues?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            user_id: "v1",
            venue_name: "Casa da Lapa",
            city: "Rio de Janeiro",
            state: "RJ",
            capacity: 300,
            rating: 4.7,
            review_count: 18,
            is_community: false,
            created_at: "2026-03-14T00:00:00Z",
          },
        ]),
      });
    });

    await page.goto("/venues");

    await expect(page.locator("h1", { hasText: "Venues" })).toBeVisible();
    await expect(page.getByText("Casa da Lapa")).toBeVisible();
    await expect(page.getByText("Rio de Janeiro, RJ")).toBeVisible();
  });

  test("loads city suggestions from backend for venue filters", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST", email: "artist@artistlog.com" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/venues?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            user_id: "v1",
            venue_name: "Casa da Lapa",
            city: "Rio de Janeiro",
            state: "RJ",
            capacity: 300,
            rating: 4.7,
            review_count: 18,
            is_community: false,
            created_at: "2026-03-14T00:00:00Z",
          },
        ]),
      });
    });

    let citySearchCalls = 0;
    await page.route("**://localhost:8080/cities/search?**", async (route) => {
      citySearchCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cities: [{ name: "Recife", state: "PE", latitude: -8.05, longitude: -34.88 }],
        }),
      });
    });

    await page.goto("/venues");

    const cityInput = page.getByLabel("Cidade");
    await cityInput.fill("Rec");

    await expect(page.getByRole("option", { name: /Recife/ })).toBeVisible();
    await page.getByRole("option", { name: /Recife/ }).click();

    await expect(cityInput).toHaveValue("Recife");
    expect(citySearchCalls).toBeGreaterThan(0);
  });
});
