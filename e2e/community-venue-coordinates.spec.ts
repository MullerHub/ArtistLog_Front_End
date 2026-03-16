import { test, expect } from "@playwright/test";
import { mockNotificationFeed, seedAuthenticatedUser } from "./helpers/session";

test.describe("Community Venue Coordinates", () => {
  test("submits latitude and longitude when creating a community venue", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST", email: "artist@artistlog.com" });
    await mockNotificationFeed(page);

    await page.addInitScript(() => {
      const geolocation = {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: -23.56211,
              longitude: -46.65432,
              accuracy: 1,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          } as GeolocationPosition);
        },
        watchPosition: () => 0,
        clearWatch: () => {},
      };

      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: geolocation,
      });
    });

    await page.route("**://localhost:8080/venues/community?**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
        return;
      }

      await route.fallback();
    });

    await page.route("**://localhost:8080/cities/search?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cities: [{ name: "Sao Paulo", state: "SP", latitude: -23.55, longitude: -46.63 }],
        }),
      });
    });

    let submittedPayload: Record<string, unknown> | null = null;
    await page.route("**://localhost:8080/venues/community", async (route) => {
      submittedPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "venue-new", message: "ok" }),
      });
    });

    await page.route("**://localhost:8080/venues/venue-new", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user_id: "venue-new",
          venue_name: "Praca da Liberdade",
          city: "Sao Paulo",
          state: "SP",
          capacity: 500,
          location: { latitude: -23.56211, longitude: -46.65432 },
        }),
      });
    });

    await page.route("**://localhost:8080/venues/venue-new/reviews", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });

    await page.goto("/venues/community");
    await page.getByRole("tab", { name: "Adicionar local" }).click();

    await page.getByPlaceholder("Ex: Praça da Liberdade").fill("Praca da Liberdade");

    const cityInput = page.getByLabel("Cidade");
    await cityInput.fill("Sao");
    await page.getByRole("option", { name: /Sao Paulo/ }).click();

    await expect(page.getByRole("link", { name: "OpenStreetMap" })).toBeVisible();

    await page.locator('button[title="Usar minha localização"]').click();
    await page.getByRole("button", { name: "Adicionar local" }).click();

    await expect.poll(() => submittedPayload !== null).toBeTruthy();
    expect(submittedPayload?.["latitude"]).toBe(-23.56211);
    expect(submittedPayload?.["longitude"]).toBe(-46.65432);
  });
});
