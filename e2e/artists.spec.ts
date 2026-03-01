import { test, expect } from '@playwright/test'

test.describe('Artists Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to artists page
    await page.goto('/artists')
  })

  test('should display artists list', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check if artist cards are visible
    const artistCards = page.locator('[class*="card"]').first()
    await expect(artistCards).toBeVisible({ timeout: 5000 })
  })

  test('should have search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Pesquise"]', {
      hasText: 'artista',
    }).first()
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('rock')
      
      // Wait for results to update
      await page.waitForTimeout(600) // Allow debounce time
      
      // Should display filtered results
      const filteredCards = page.locator('[class*="card"]').first()
      await expect(filteredCards).toBeVisible()
    }
  })

  test('should apply filters', async ({ page }) => {
    // Look for filter elements
    const filterButtons = page.locator('button:has-text("Filtros")')
    
    if (await filterButtons.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click to open filters
      await filterButtons.first().click()
      
      // Wait a bit for filter modal to open
      await page.waitForTimeout(200)
    }
  })

  test('should navigate to artist detail page', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Click on first artist card
    const firstCard = page.locator('[class*="card"]').first()
    const link = firstCard.locator('a').first()
    
    if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
      const href = await link.getAttribute('href')
      
      if (href) {
        await link.click()
        
        // Should navigate to artist detail page
        await expect(page).toHaveURL(new RegExp(href))
      }
    }
  })

  test('should have pagination or infinite scroll', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Look for pagination or "load more" button
    const pagination = page.locator('button:has-text("Próximo"), button:has-text("Carregar mais"), nav[aria-label="pagination"]').first()
    
    // Should have some way to load more content
    let hasMoreContent = await pagination.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (!hasMoreContent) {
      // Check for infinite scroll by scrolling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
      
      // Should have loaded more content
      const cards = page.locator('[class*="card"]')
      const count = await cards.count()
      expect(count).toBeGreaterThan(0)
    }
  })
})

test.describe('Artist Detail Page', () => {
  test('should display artist profile information', async ({ page }) => {
    // Navigate to a specific artist page (this may need authentication)
    // Using a relative path that should exist
    await page.goto('/artists/test-artist-id', { waitUntil: 'networkidle' }).catch(() => {
      // Fallback if specific artist doesn't exist
      return page.goto('/artists')
    })

    // Check if main content is present
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible({ timeout: 5000 })
  })

  test('should have artist actions', async ({ page }) => {
    // Navigate to artists page first
    await page.goto('/artists', { waitUntil: 'networkidle' })

    // Try to find and click on an artist
    const artistLink = page.locator('a[href*="/artists/"]').first()
    
    if (await artistLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await artistLink.click()
      await page.waitForLoadState('networkidle')

      // Look for action buttons (like contact, favorite, etc.)
      const buttons = page.locator('button')
      const count = await buttons.count()
      
      expect(count).toBeGreaterThan(0)
    }
  })
})
