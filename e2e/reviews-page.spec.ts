import { test, expect } from "@playwright/test";
import { mockNotificationFeed, seedAuthenticatedUser } from "./helpers/session";

test.describe("Reviews Page", () => {
  test("lists reviews for selected venue", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST", email: "artist@artistlog.com" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/venues?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            user_id: "v1",
            venue_name: "Casa Central",
            city: "Sao Paulo",
            state: "SP",
            capacity: 250,
            rating: 4.8,
            review_count: 20,
            is_community: false,
            created_at: "2026-03-14T00:00:00Z",
          },
        ]),
      });
    });

    await page.route("**://localhost:8080/venues/v1/reviews**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "r1",
            author_id: "a1",
            author_name: "DJ Aurora",
            venue_id: "v1",
            rating: 5,
            comment: "Ambiente excelente",
            created_at: "2026-03-12T00:00:00Z",
          },
        ]),
      });
    });

    await page.route("**://localhost:8080/venues/v1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user_id: "v1",
          venue_name: "Casa Central",
          city: "Sao Paulo",
          state: "SP",
          capacity: 250,
        }),
      });
    });

    await page.goto("/reviews");

    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Casa Central" }).click();

    await expect(page.getByText("Ambiente excelente")).toBeVisible();
  });

  test("shows empty state when selected venue has no reviews", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/venues?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            user_id: "v2",
            venue_name: "Arena Sul",
            city: "Curitiba",
            state: "PR",
            capacity: 500,
            rating: 4.5,
            review_count: 0,
            is_community: false,
            created_at: "2026-03-14T00:00:00Z",
          },
        ]),
      });
    });

    await page.route("**://localhost:8080/venues/v2/reviews**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });

    await page.route("**://localhost:8080/venues/v2", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user_id: "v2",
          venue_name: "Arena Sul",
          city: "Curitiba",
          state: "PR",
          capacity: 500,
        }),
      });
    });

    await page.goto("/reviews");

    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Arena Sul" }).click();

    await expect(page.getByText("Nenhuma avaliação encontrada para este contratante.")).toBeVisible();
  });
});
