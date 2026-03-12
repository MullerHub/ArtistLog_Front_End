import { expect, test, type Page } from '@playwright/test'
import { setupRealBackendSession } from './fixtures/real-backend-session'

/**
 * Testes E2E de contratos com backend real.
 * Usa dados mockados que já existem no backend (sem page.route no frontend).
 */

test.describe('Contracts Page - E2E com Backend Real', () => {
  test.describe.configure({ mode: 'serial' })

  async function openFirstContract(page: Page): Promise<boolean> {
    const firstContractCard = page.locator('[data-testid="contract-card"]').first()
    const visible = await firstContractCard.isVisible().catch(() => false)

    if (!visible) {
      await page.goto('/contracts', { waitUntil: 'domcontentloaded' })
    }

    const canOpen = await firstContractCard.isVisible({ timeout: 5000 }).catch(() => false)
    if (!canOpen) {
      return false
    }

    await firstContractCard.click()
    return true
  }

  test.beforeEach(async ({ page, request }) => {
    await setupRealBackendSession(page, request)
    await page.goto('/contracts', { waitUntil: 'domcontentloaded' })
  })

  test('renderiza card e detalhes do contrato', async ({ page }) => {
    if (!(await openFirstContract(page))) test.skip(true, 'Sem contratos seedados no backend para este usuário')

    await expect(page.locator('[data-testid="tab-detalhes"]')).toBeVisible()
    await expect(page.locator('text=Data do Evento')).toBeVisible()
    await expect(page.locator('text=Valor do Contrato')).toBeVisible()
    await expect(page.locator('[data-testid="status-badge"]')).toBeVisible()
  })

  test('envia proposta e tenta aceitar na aba Propostas', async ({ page }) => {
    if (!(await openFirstContract(page))) test.skip(true, 'Sem contratos seedados no backend para este usuário')
    await page.locator('[data-testid="tab-trigger-proposals"]').click()

    await expect(page.locator('[data-testid="proposals-tab"]')).toBeVisible()

    const uniqueMessage = `Proposta E2E real ${Date.now()}`

    await page
      .locator('textarea[placeholder="Mensagem da proposta (obrigatória)"]')
      .fill(uniqueMessage)
    await page.locator('input[placeholder="Preço (R$)"]').fill('4200')
    await page.locator('[data-testid="send-proposal-button"]').click()

    await expect(
      page.locator('[data-testid="proposal-item"]').filter({ hasText: uniqueMessage })
    ).toHaveCount(1)

    const acceptButtons = page.getByRole('button', { name: /Aceitar/i })
    if ((await acceptButtons.count()) > 0) {
      await acceptButtons.first().click()
      await expect(page.locator('[data-testid="proposal-status"]').first()).toBeVisible()
    }
  })

  test('envia mensagem na aba Chat', async ({ page }) => {
    if (!(await openFirstContract(page))) test.skip(true, 'Sem contratos seedados no backend para este usuário')
    await page.locator('[data-testid="tab-trigger-messages"]').click()

    await expect(page.locator('[data-testid="messages-tab"]')).toBeVisible()

    const uniqueMessage = `Mensagem E2E real ${Date.now()}`

    await page.locator('textarea[placeholder="Digite sua mensagem..."]').fill(uniqueMessage)
    await page.locator('[data-testid="send-message-button"]').click()

    await expect(
      page.locator('[data-testid="message-item"]').filter({ hasText: uniqueMessage })
    ).toHaveCount(1)
  })

  test('exibe timeline de auditoria na aba Auditoria', async ({ page }) => {
    if (!(await openFirstContract(page))) test.skip(true, 'Sem contratos seedados no backend para este usuário')
    await page.locator('[data-testid="tab-trigger-audit"]').click()

    await expect(page.locator('[data-testid="audit-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="audit-timeline"]')).toBeVisible()
    await expect(page.locator('[data-testid="audit-item"]').first()).toBeVisible()
  })
})
