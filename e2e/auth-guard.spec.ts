import { test, expect } from "@playwright/test";

test.describe("Auth Guard", () => {
  test("redirects unauthenticated user from protected route to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});
