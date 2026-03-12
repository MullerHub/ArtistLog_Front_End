import { expect, test } from "@playwright/test"
import { setupAuthMocks } from "./fixtures/setup-mocks"
import { seededArtists, seededArtistUser } from "./fixtures/backend-seed-fixtures"

const artistsApiPattern = /http:\/\/(localhost|127\.0\.0\.1):8080\/artists(?:\?.*)?$/

test.describe("Artists Filters - E2E Local", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMocks(page)

    await page.route(artistsApiPattern, async (route) => {
      const url = new URL(route.request().url())
      const tagsQuery = (url.searchParams.get("tags") || "").toLowerCase()
      const csv = tagsQuery
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      const result = csv.length
        ? seededArtists.filter((artist) =>
            (artist.tags || []).some((tag) => csv.includes(tag.toLowerCase()))
          )
        : seededArtists

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(result),
      })
    })

    await page.goto("/login")
    await page.evaluate((user) => {
      localStorage.setItem("artistlog_token", "mock-token-test")
      localStorage.setItem("artistlog_user", JSON.stringify(user))
    }, seededArtistUser)

    await page.goto("/artists")
    await expect(page).toHaveURL(/\/artists$/)
  })

  test("applies quick tag House without showing backend error", async ({ page }) => {
    await page.waitForLoadState("networkidle")

    const expandFiltersButton = page.getByRole("button", { name: /Expandir filtros/i })
    if (await expandFiltersButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expandFiltersButton.click()
    }

    const quickTag = page.getByTestId("quick-tag-house")
    await expect(quickTag).toBeVisible()
    await quickTag.click()

    await page.waitForTimeout(700)

    await expect(page.locator("text=Erro ao carregar artistas")).toHaveCount(0)
    await expect(page.locator("text=DJ Silva")).toBeVisible()
    await expect(page.locator("text=Lucas & Friends")).toHaveCount(0)
    await expect(page.locator("text=Ana Costa")).toHaveCount(0)
  })
})
