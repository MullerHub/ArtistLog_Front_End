import { test, expect } from "@playwright/test";
import { mockNotificationFeed, seedAuthenticatedUser } from "./helpers/session";

test.describe("Schedule Page", () => {
  test("renders artist schedule slots", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST", email: "artist@artistlog.com" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/artists/me/schedule", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "s1",
          min_gig_duration: 2,
          slots: [
            {
              id: "slot-1",
              day_of_week: 1,
              start_time: "20:00",
              end_time: "23:00",
              is_booked: false,
            },
          ],
        }),
      });
    });

    await page.goto("/schedule");

    await expect(page.getByText("Disponibilidade semanal")).toBeVisible();
    await expect(page.getByText("20:00 - 23:00")).toBeVisible();
  });

  test("blocks venue user with restricted access state", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "VENUE", email: "venue@artistlog.com" });
    await mockNotificationFeed(page);

    await page.goto("/schedule");

    await expect(page.getByText("Acesso restrito")).toBeVisible();
    await expect(page.getByText("A gestão de agenda está disponível apenas para artistas.")).toBeVisible();
  });
});
