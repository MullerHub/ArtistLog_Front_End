import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("logs in and reaches dashboard", async ({ page }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "e2e-token",
          user: {
            id: "user-1",
            email: "artist@artistlog.com",
            role: "ARTIST",
            created_at: "2026-03-14T00:00:00Z",
          },
        }),
      });
    });

    await page.route("**/notifications?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/login");

    await page.getByLabel("Email").fill("artist@artistlog.com");
    await page.getByLabel("Senha").fill("123456");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ações rápidas" })).toBeVisible();
  });
});
