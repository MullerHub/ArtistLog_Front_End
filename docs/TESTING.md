# 🧪 Guia Completo de Testes - ArtistLog Frontend

## 📋 Visão Geral

Este documento descreve a estratégia de testes implementada para cobrir toda a aplicação ArtistLog com **testes unitários (Jest)** e **testes E2E (Playwright)**.

## 🎯 Estratégia de Teste

### Pirâmide de Testes

```
         E2E (10-15%)
       /             \
      /               \
Integration (20-30%)
    /                   \
   /                     \
Unit Tests (70-80%)
```

### Cobertura por Tipo

| Tipo | Ferramenta | Cobertura | Objetivo |
|------|-----------|----------|----------|
| **Unit** | Jest + React Testing Library | 70-80% | Testar componentes, hooks, utilidades individuais |
| **Integration** | Jest + React Testing Library | 20-30% | Testar interações entre múltiplos componentes |
| **E2E** | Playwright | 10-15% | Testar fluxos críticos do usuário |

## 📁 Estrutura de Arquivos de Teste

```
project/
├── components/
│   ├── __tests__/
│   │   ├── badge.test.tsx
│   │   ├── button.test.tsx
│   │   └── ...
│   └── ui/
│
├── lib/
│   ├── services/
│   │   ├── __tests__/
│   │   │   ├── artists.service.test.ts
│   │   │   ├── venues.service.test.ts
│   │   │   └── ...
│   │   └── ...
│   └── __tests__/
│       └── api-client.test.ts
│
├── hooks/
│   ├── __tests__/
│   │   ├── use-debounce.test.ts
│   │   └── ...
│   └── ...
│
├── e2e/
│   ├── auth.spec.ts
│   ├── navigation.spec.ts
│   ├── artists.spec.ts
│   └── ...
│
├── jest.config.js
├── jest.setup.js
├── playwright.config.ts
└── README.md
```

## 🚀 Executar Testes

### Testes Unitários (Jest)

```bash
# Executar todos os testes unitários
npm test

# Executar em modo watch (reexecuta ao fazer mudanças)
npm test -- --watch

# Executar com cobertura
npm test -- --coverage

# Executar um arquivo específico
npm test -- badge.test.tsx

# Executar com padrão de nome específico
npm test -- --testNamePattern="Badge Component"
```

### Testes E2E (Playwright)

```bash
# Executar todos os testes E2E
npx playwright test

# Executar em modo UI (interativo)
npx playwright test --ui

# Executar um arquivo específico
npx playwright test e2e/auth.spec.ts

# Executar com navegador específico
npx playwright test --project=chromium

# Executar em modo debug
npx playwright test --debug

# Visualizar relatório HTML
npx playwright show-report
```

### Scripts Predefinidos (adicionar ao package.json)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern='__tests__'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

## 📊 Analisar Cobertura de Código

### Gerar Relatório de Cobertura

```bash
npm test -- --coverage
```

Isso gera um arquivo `coverage/lcov-report/index.html` que você pode abrir no navegador.

### Arquivos Cobertos por Padrão

```
✅ app/**/*.{js,jsx,ts,tsx}
✅ components/**/*.{js,jsx,ts,tsx}
✅ lib/**/*.{js,jsx,ts,tsx}
✅ hooks/**/*.{js,jsx,ts,tsx}

❌ node_modules/**
❌ .next/**
❌ coverage/**
```

## 🧩 Estrutura dos Testes

### Teste Unitário de Componente

```typescript
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>)
    expect(screen.getByText('Default Badge')).toBeInTheDocument()
  })
})
```

### Teste de Serviço (Mock API)

```typescript
import { artistsService } from '@/lib/services/artists.service'
import { apiClient } from '@/lib/api-client'

jest.mock('@/lib/api-client')

describe('Artists Service', () => {
  it('should fetch all artists', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue([...])
    const result = await artistsService.getAll({})
    expect(result).toBeDefined()
  })
})
```

### Teste de Hook

```typescript
import { renderHook } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce Hook', () => {
  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )
    // Testando comportamento...
  })
})
```

### Teste E2E

```typescript
import { test, expect } from '@playwright/test'

test('should display artists list', async ({ page }) => {
  await page.goto('/artists')
  await expect(page.locator('[class*="card"]').first()).toBeVisible()
})
```

## 📈 Métricas de Cobertura Esperada

### Limiar Mínimo de Cobertura

```javascript
coverageThreshold: {
  global: {
    branches: 50,     // 50% das branches executadas
    functions: 50,    // 50% das funções executadas
    lines: 50,        // 50% das linhas executadas
    statements: 50    // 50% dos statements executados
  }
}
```

**Aumentar gradualmente:**
- Fase 1 (Atual): 50%
- Fase 2: 70%
- Fase 3: 80%
- Fase 4 (Alvo): 85%+

## 🔍 Checklist de Testes Necessários

### ✅ Componentes UI (Alta Prioridade)

- [ ] Badge, Button, Card
- [ ] Dialog, Dropdown Menu, Toast
- [ ] Input, Select, Checkbox, Switch
- [ ] Form com validação

### ✅ Páginas (Alta Prioridade)

- [ ] Login / Register
- [ ] Dashboard (Artist + Venue)
- [ ] Artists List + Detail
- [ ] Venues List + Detail
- [ ] Settings

### ✅ Serviços (Alta Prioridade)

- [ ] `artists.service.ts` - getAll, getById, registerView
- [ ] `venues.service.ts` - getAll, getById, registerView
- [ ] `auth.service.ts` - login, logout, register
- [ ] `api-client.ts` - request, requestPublic, error handling

### ⚠️ Hooks (Média Prioridade)

- [ ] `use-debounce.ts`
- [ ] `use-mobile.tsx`
- [ ] `use-websocket.ts`
- [ ] `use-toast.ts`
- [ ] `use-theme.ts`

### ⚠️ Fluxos E2E (Média Prioridade)

- [ ] Authentication (login, register, logout)
- [ ] Navigation entre páginas
- [ ] Visualização de artistas/venues
- [ ] Busca e filtros
- [ ] Notificações
- [ ] Settings/Preferências

## 🐛 Convenções e Boas Práticas

### Nomenclatura de Testes

```typescript
// ❌ Evitar
test('it works')
test('should do something')

// ✅ Preferir
test('should render badge with default variant')
test('should filter artists by genre when filter is applied')
test('should navigate to artist detail page on card click')
```

### Estrutura AAA (Arrange-Act-Assert)

```typescript
test('should handle user input', () => {
  // ARRANGE - Preparar
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click</Button>)
  
  // ACT - Executar
  fireEvent.click(screen.getByRole('button'))
  
  // ASSERT - Verificar
  expect(handleClick).toHaveBeenCalled()
})
```

### Mocks e Stubs

```typescript
// Mock de módulos
jest.mock('@/lib/api-client')

// Mock de funções específicas
(apiClient.get as jest.Mock).mockResolvedValue(data)

// Limpar mocks entre testes
beforeEach(() => {
  jest.clearAllMocks()
})
```

## 📝 Integração Contínua (CI)

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

## 🎓 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 💡 Próximos Passos

1. **Expandir cobertura unitária** de 50% para 70%
2. **Adicionar testes E2E críticos** para fluxos principais
3. **Integrar com CI/CD** pipeline
4. **Configurar coverage reports** no GitHub
5. **Treinar equipe** em testes e TDD

---

**Última atualização:** 28 de Fevereiro de 2026  
**Versão:** 1.0.0
