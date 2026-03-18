import { test, expect } from "@playwright/test";

test.describe("Register City Search", () => {
  test("loads mocked backend cities for artist signup", async ({ page }) => {
    let citySearchCalls = 0;

    await page.route("**://localhost:8080/cities/search?**", async (route) => {
      citySearchCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cities: [
            { name: "Sao Paulo", state: "SP", latitude: -23.55, longitude: -46.63 },
            { name: "Sao Jose dos Campos", state: "SP", latitude: -23.18, longitude: -45.88 },
          ],
        }),
      });
    });

    await page.goto("/register");
    await page.getByRole("button", { name: "Sou Artista" }).click();

    const cityInput = page.getByLabel("Cidade (comece a digitar para buscar)");
    await cityInput.fill("Sao");

    await expect(page.getByRole("option", { name: /Sao Paulo/ })).toBeVisible();
    await page.getByRole("option", { name: /Sao Paulo/ }).click();

    await expect(page.getByText("Estado:", { exact: false })).toContainText("SP");
    expect(citySearchCalls).toBeGreaterThan(0);
  });
});
