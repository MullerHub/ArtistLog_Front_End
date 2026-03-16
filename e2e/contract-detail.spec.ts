import { test, expect } from "@playwright/test";
import { mockNotificationFeed, seedAuthenticatedUser } from "./helpers/session";

test.describe("Contract Detail", () => {
  test("renders detail and tabbed data from API", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST", email: "artist@artistlog.com" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/contracts/c1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "c1",
          title: "Show Especial",
          status: "ACCEPTED",
          artist_id: "a1",
          artist_name: "DJ Aurora",
          venue_id: "v1",
          venue_name: "Casa da Lapa",
          event_date: "2026-03-21T00:00:00Z",
          event_type: "Balada",
          final_price: 2800,
          description: "Set principal",
          created_at: "2026-03-10T00:00:00Z",
          updated_at: "2026-03-11T00:00:00Z",
        }),
      });
    });

    await page.route("**://localhost:8080/contracts/c1/proposals", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "p1",
            contract_id: "c1",
            proposed_by_user_id: "v1",
            proposed_by_role: "VENUE",
            proposed_price: 3000,
            status: "PENDING",
            message: "Podemos ajustar para 3000",
            created_at: "2026-03-12T00:00:00Z",
          },
        ]),
      });
    });

    await page.route("**://localhost:8080/contracts/c1/messages", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "m1",
            contract_id: "c1",
            sender_id: "v1",
            sender_role: "VENUE",
            message: "Confirmado para sexta.",
            created_at: "2026-03-13T10:00:00Z",
          },
        ]),
      });
    });

    await page.route("**://localhost:8080/contracts/c1/messages/unread", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unread_count: 1 }),
      });
    });

    await page.route("**://localhost:8080/contracts/c1/audit", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "a1",
            contract_id: "c1",
            action: "STATUS_UPDATED",
            user_id: "system",
            user_role: "SYSTEM",
            created_at: "2026-03-13T08:00:00Z",
          },
        ]),
      });
    });

    await page.route("**://localhost:8080/contracts/c1/template", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "t1",
          contract_id: "c1",
          template_name: "Template Show",
          file_url: "https://files/template.pdf",
          artist_id: "a1",
          created_at: "2026-03-13T09:00:00Z",
        }),
      });
    });

    await page.goto("/contracts/c1");

    await expect(page.locator("h1")).toHaveText("Show Especial");
    await expect(page.getByText("DJ Aurora")).toBeVisible();

    await page.getByRole("tab", { name: "Propostas" }).click();
    await expect(page.getByText("Podemos ajustar para 3000")).toBeVisible();

    await page.getByRole("tab", { name: "Chat" }).click();
    await expect(page.getByText("Confirmado para sexta.")).toBeVisible();

    await page.getByRole("tab", { name: "Templates" }).click();
    await expect(page.getByText("Template Show")).toBeVisible();
  });

  test("shows not found state when contract endpoint fails", async ({ page }) => {
    await seedAuthenticatedUser(page, { role: "ARTIST" });
    await mockNotificationFeed(page);

    await page.route("**://localhost:8080/contracts/c404**", async (route) => {
      await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "not found" }) });
    });

    await page.goto("/contracts/c404");
    await expect(page.getByText("Contrato não encontrado")).toBeVisible({ timeout: 15000 });
  });
});
