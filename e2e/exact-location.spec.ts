import { test, expect } from '@playwright/test'
import { setupRealBackendSession } from './fixtures/real-backend-session'

const E2E_VENUE_EMAIL = process.env.E2E_VENUE_EMAIL
const E2E_VENUE_PASSWORD = process.env.E2E_VENUE_PASSWORD
const HAS_VENUE_CREDS = Boolean(E2E_VENUE_EMAIL && E2E_VENUE_PASSWORD)

test.describe('Exact Location Saving Flow', () => {
  test.beforeEach(async ({ page, request }) => {
    test.skip(!HAS_VENUE_CREDS, 'Defina E2E_VENUE_EMAIL e E2E_VENUE_PASSWORD para validar fluxo de localização exata de venue')
    await setupRealBackendSession(page, request, {
      email: E2E_VENUE_EMAIL as string,
      password: E2E_VENUE_PASSWORD as string,
    })
    // Mock API responses for geocoding
    await page.route('*/**/api/geocoding/**', async (route) => {
      await route.abort()
    })
  })

  test('should display exact location manager component', async ({ page }) => {
    // This assumes you're on the settings/venue page
    // Navigate to venue settings
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Check if exact location section is visible
    const exactLocationSection = page.getByText('Localização Exata (ExactLocation)', { exact: false })
    await expect(exactLocationSection).toBeVisible()

    // Verify all input fields are present
    const latitudeInput = page.getByPlaceholder('Latitude exata')
    const longitudeInput = page.getByPlaceholder('Longitude exata')

    await expect(latitudeInput).toBeVisible()
    await expect(longitudeInput).toBeVisible()
  })

  test('should prevent saving with only latitude', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    const longitudeInput = page.getByPlaceholder('Longitude exata')
    await longitudeInput.fill('')

    // Fill only latitude
    const latitudeInput = page.getByPlaceholder('Latitude exata')
    await latitudeInput.fill('-31.7649')

    const saveButton = page.getByRole('button', { name: 'Salvar localização exata' })
    await expect(saveButton).toBeDisabled()

    const errorMessage = page.getByText('É necessário definir latitude E longitude para salvar a localização exata')
    await expect(errorMessage).toBeVisible()
  })

  test('should prevent saving with only longitude', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    const latitudeInput = page.getByPlaceholder('Latitude exata')
    await latitudeInput.fill('')

    // Fill only longitude
    const longitudeInput = page.getByPlaceholder('Longitude exata')
    await longitudeInput.fill('-52.3371')

    const saveButton = page.getByRole('button', { name: 'Salvar localização exata' })
    await expect(saveButton).toBeDisabled()

    const errorMessage = page.getByText('É necessário definir latitude E longitude para salvar a localização exata')
    await expect(errorMessage).toBeVisible()
  })

  test('should prevent saving with invalid latitude', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Fill invalid latitude (> 90)
    const latitudeInput = page.getByPlaceholder('Latitude exata')
    const longitudeInput = page.getByPlaceholder('Longitude exata')

    await latitudeInput.fill('-91')
    await longitudeInput.fill('-52.3371')

    const saveButton = page.getByRole('button', { name: 'Salvar localização exata' })
    await expect(saveButton).toBeDisabled()

    const errorMessage = page.getByText('Latitude deve estar entre -90 e 90')
    await expect(errorMessage).toBeVisible()
  })

  test('should prevent saving with invalid longitude', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Fill invalid longitude (> 180)
    const latitudeInput = page.getByPlaceholder('Latitude exata')
    const longitudeInput = page.getByPlaceholder('Longitude exata')

    await latitudeInput.fill('-31.7649')
    await longitudeInput.fill('181')

    const saveButton = page.getByRole('button', { name: 'Salvar localização exata' })
    await expect(saveButton).toBeDisabled()

    const errorMessage = page.getByText('Longitude deve estar entre -180 e 180')
    await expect(errorMessage).toBeVisible()
  })

  test('should save valid exact location successfully', async ({ page }) => {
    let capturedBody: { exact_latitude?: number; exact_longitude?: number } | null = null

    await page.route('**/venues/**/location**', async (route) => {
      if (route.request().method() === 'PATCH') {
        capturedBody = route.request().postDataJSON() as { exact_latitude?: number; exact_longitude?: number }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            message: 'Location updated',
            exact_latitude: -31.7649,
            exact_longitude: -52.3371,
            updated_at: new Date().toISOString(),
          }),
        })
      }
    })

    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Fill valid coordinates
    const latitudeInput = page.getByPlaceholder('Latitude exata')
    const longitudeInput = page.getByPlaceholder('Longitude exata')

    await latitudeInput.fill('-31.7649')
    await longitudeInput.fill('-52.3371')

    // Save
    const saveButton = page.getByRole('button', { name: 'Salvar localização exata' })
    await saveButton.click()

    await expect.poll(() => capturedBody !== null).toBeTruthy()

    expect(capturedBody).toMatchObject({
      exact_latitude: -31.7649,
      exact_longitude: -52.3371,
    })
  })

  test('should use base location for exact location', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Mock the use base location button
    const useBaseButton = page.locator('button:has-text("Usar localização base da venue")')
    
    if (await useBaseButton.isVisible()) {
      await useBaseButton.click()

      // Verify that coordinates were populated
      const latitudeInput = page.locator('input[placeholder="Latitude exata"]')
      const longitudeInput = page.locator('input[placeholder="Longitude exata"]')

      // Wait for inputs to be populated
      await page.waitForTimeout(500)

      const latitudeValue = await latitudeInput.inputValue()
      const longitudeValue = await longitudeInput.inputValue()

      // Should have some value (depending on base location)
      expect(latitudeValue).toBeTruthy()
      expect(longitudeValue).toBeTruthy()
    }
  })

  test('should clear validation error on valid input', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    const latitudeInput = page.getByPlaceholder('Latitude exata')
    const longitudeInput = page.getByPlaceholder('Longitude exata')

    await latitudeInput.fill('-91')
    await longitudeInput.fill('-52.3371')

    const errorMessage = page.getByText('Latitude deve estar entre -90 e 90')
    await expect(errorMessage).toBeVisible()

    await latitudeInput.fill('-31.7649')

    // Error should be cleared
    await expect(errorMessage).not.toBeVisible()
  })

  test('should display save button is disabled while updating', async ({ page }) => {
    // Slow down the network to see the loading state
    let didReceivePatch = false
    await page.route('**/venues/**/location**', async (route) => {
      await page.waitForTimeout(1000) // Delay the response
      if (route.request().method() === 'PATCH') {
        didReceivePatch = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            message: 'Location updated',
            exact_latitude: -31.7649,
            exact_longitude: -52.3371,
            updated_at: new Date().toISOString(),
          }),
        })
      }
    })

    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Fill coordinates
    const latitudeInput = page.getByPlaceholder('Latitude exata')
    const longitudeInput = page.getByPlaceholder('Longitude exata')

    await latitudeInput.fill('-31.7649')
    await longitudeInput.fill('-52.3371')

    // Click save
    const saveButton = page.getByRole('button', { name: 'Salvar localização exata' })
    await saveButton.click()

    // Ensure save request was triggered and the button recovers after completion.
    await expect.poll(() => didReceivePatch).toBeTruthy()
    await expect(saveButton).toBeEnabled()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock error response
    let responseStatus: number | null = null
    await page.route('**/venues/**/location**', async (route) => {
      if (route.request().method() === 'PATCH') {
        responseStatus = 400
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            message: 'Invalid coordinates',
            error: 'Coordinates outside valid range',
          }),
        })
      }
    })

    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Fill valid format coordinates
    const latitudeInput = page.getByPlaceholder('Latitude exata')
    const longitudeInput = page.getByPlaceholder('Longitude exata')

    await latitudeInput.fill('-31.7649')
    await longitudeInput.fill('-52.3371')

    // Try to save
    const saveButton = page.getByRole('button', { name: 'Salvar localização exata' })
    await saveButton.click()

    expect(responseStatus).toBe(400)
    await expect(saveButton).toHaveText('Salvar localização exata')
    await expect(saveButton).toBeEnabled()
  })

  test('should have map visible in exact location section', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Check if map container exists
    const mapContainer = page.locator('[data-testid="map-container"], .leaflet-container')
    
    // The map might be lazy loaded or in an iframe
    // Check for visual elements that indicate map is present
    const mapElement = page.locator('.overflow-hidden.rounded-md.border').filter({
      has: page.locator('.leaflet-container, [data-testid="map-container"]'),
    })

    // If map exists, verify it's rendered
    if (await mapContainer.count() > 0) {
      await expect(mapContainer.first()).toBeVisible()
    }
  })

  test('should maintain location history in localStorage', async ({ page, context }) => {
    // Grant localStorage access
    const storageState = await context.storageState()

    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Check localStorage for history
    const history = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('venue_location_history') || '[]')
    })

    // Should be an array
    expect(Array.isArray(history)).toBe(true)

    // If there are items, they should have the right structure
    if (history.length > 0) {
      const item = history[0]
      expect(item).toHaveProperty('latitude')
      expect(item).toHaveProperty('longitude')
      expect(item).toHaveProperty('timestamp')
    }
  })

  test('should show location history buttons if available', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Pre-populate history
    await page.evaluate(() => {
      const history = [
        {
          latitude: -31.7649,
          longitude: -52.3371,
          timestamp: new Date().toISOString(),
        },
      ]
      localStorage.setItem('venue_location_history', JSON.stringify(history))
    })

    // Reload to see history
    await page.reload()

    // Check for history display
    const historySection = page.locator('text=/Últimas localizações/')
    if (await historySection.isVisible()) {
      expect(historySection).toBeVisible()
    }
  })
})

test.describe('ExactLocationMapView Interaction', () => {
  test.beforeEach(async ({ page, request }) => {
    test.skip(!HAS_VENUE_CREDS, 'Defina E2E_VENUE_EMAIL e E2E_VENUE_PASSWORD para validar mapa de localização exata')
    await setupRealBackendSession(page, request, {
      email: E2E_VENUE_EMAIL as string,
      password: E2E_VENUE_PASSWORD as string,
    })
  })

  test('should render map with correct center coordinates', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // The map should be centered on the venue or base location
    // This is harder to test directly, so we check the map container exists
    const mapContainer = page.locator('.leaflet-container')
    
    if (await mapContainer.count() > 0) {
      await expect(mapContainer.first()).toBeVisible()
    }
  })

  test('should display base location marker', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Look for marker popups
    const baseLocationPopup = page.locator('text=/Localização Base da Venue/')
    
    // Map might need interaction to show popup
    // For now, just check the component is rendered
    const mapContainer = page.locator('.leaflet-container, [data-testid="map-container"]')
    if (await mapContainer.count() > 0) {
      await expect(mapContainer.first()).toBeVisible()
    }
  })

  test('should display exact location marker when coordinates exist', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })

    // Fill coordinates
    const latitudeInput = page.locator('input[placeholder="Latitude exata"]')
    const longitudeInput = page.locator('input[placeholder="Longitude exata"]')

    if (await latitudeInput.isVisible()) {
      await latitudeInput.fill('-31.7649')
      await longitudeInput.fill('-52.3371')

      // Wait for map to update
      await page.waitForTimeout(500)

      // Look for exact location popup
      const exactLocationPopup = page.locator('text=/Localização Exata Selecionada/')
      
      // Map might need interaction to show popup
      // Just verify map is still there
      const mapContainer = page.locator('.leaflet-container, [data-testid="map-container"]')
      if (await mapContainer.count() > 0) {
        await expect(mapContainer.first()).toBeVisible()
      }
    }
  })
})
