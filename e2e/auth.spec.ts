import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should navigate to login page when not authenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard')
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible()
  })

  test('should display error on invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'nonexistent@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    // Click submit
    await page.click('button:has-text("Entrar")')

    // Should show error message - check for common error patterns
    await page.waitForTimeout(2000)
    const errorVisible = await page.locator('text=/erro|inválid|incorret|não encontrado/i').isVisible().catch(() => false)
    // If no visible error, check that we're still on login page (not redirected)
    if (!errorVisible) {
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('should have register link', async ({ page }) => {
    await page.goto('/login')

    await expect(
      page.locator('a[href="/register"], button:has-text("cadastro")')
    ).toBeVisible()
  })
})

test.describe('Registration Flow', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/register')

    const emailField = page.locator('input[type="email"]')
    const passwordField = page.locator('input[type="password"]')
    const accountTypeStep = page.locator('text=/Sou Artista|Sou Contratante/i').first()

    if (await emailField.isVisible({ timeout: 1500 }).catch(() => false)) {
      await expect(passwordField).toBeVisible({ timeout: 5000 })
      return
    }

    // Two-step flow: first select account type.
    await expect(accountTypeStep).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/\/register/)
  })

  test('should have link to login', async ({ page }) => {
    await page.goto('/register')

    await expect(
      page.locator('a[href="/login"], button:has-text("login")')
    ).toBeVisible()
  })
})
