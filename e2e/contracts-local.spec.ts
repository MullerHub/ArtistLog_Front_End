import { expect, test, type Page } from '@playwright/test'
import { setupContractsMocks } from './fixtures/setup-mocks'

/**
 * Testes E2E de contratos com mocks locais (Playwright page.route).
 * Sempre funciona - não depende de backend rodando.
 * Use para desenvolvimento e CI/CD rápido.
 */

async function openFirstContract(page: Page) {
  const firstContractCard = page.locator('[data-testid="contract-card"]').first()
  await expect(firstContractCard).toBeVisible()
  await firstContractCard.click()
}

test.describe('Contracts Page - E2E Local (com Mocks)', () => {
  test.beforeEach(async ({ page }) => {
    await setupContractsMocks(page)
    await page.goto('/contracts')
    await page.waitForLoadState('networkidle')
  })

  test('renderiza card e detalhes do contrato', async ({ page }) => {
    await openFirstContract(page)

    await expect(page.locator('[data-testid="tab-detalhes"]')).toBeVisible()
    await expect(page.locator('text=Data do Evento')).toBeVisible()
    await expect(page.locator('text=Valor do Contrato')).toBeVisible()
    await expect(page.locator('[data-testid="status-badge"]')).toBeVisible()
  })

  test('envia proposta na aba Propostas', async ({ page }) => {
    await openFirstContract(page)
    await page.locator('[data-testid="tab-trigger-proposals"]').click()

    await expect(page.locator('[data-testid="proposals-tab"]')).toBeVisible()

    const proposalItems = page.locator('[data-testid="proposal-item"]')
    const beforeCount = await proposalItems.count()

    await page
      .locator('textarea[placeholder="Mensagem da proposta (obrigatória)"]')
      .fill('Proposta teste local')
    await page.locator('input[placeholder="Preço (R$)"]').fill('4200')
    await page.locator('[data-testid="send-proposal-button"]').click()

    await expect(page.locator('[data-testid="proposal-item"]')).toHaveCount(beforeCount + 1)
  })

  test('envia mensagem na aba Chat', async ({ page }) => {
    await openFirstContract(page)
    await page.locator('[data-testid="tab-trigger-messages"]').click()

    await expect(page.locator('[data-testid="messages-tab"]')).toBeVisible()

    const messageItems = page.locator('[data-testid="message-item"]')
    const beforeCount = await messageItems.count()

    await page.locator('textarea[placeholder="Digite sua mensagem..."]').fill('Mensagem teste local')
    await page.locator('[data-testid="send-message-button"]').click()

    await expect(page.locator('[data-testid="message-item"]')).toHaveCount(beforeCount + 1)
    await expect(page.locator('[data-testid="message-item"]').last()).toContainText('Mensagem teste local')
  })

  test('exibe timeline de auditoria', async ({ page }) => {
    await openFirstContract(page)
    await page.locator('[data-testid="tab-trigger-audit"]').click()

    await expect(page.locator('[data-testid="audit-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="audit-timeline"]')).toBeVisible()
    await expect(page.locator('[data-testid="audit-item"]').first()).toBeVisible()
  })
})
