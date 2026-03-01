# 📚 Boas Práticas de Testes - ArtistLog

## 🎯 Princípios Fundamentais

### 1. **FIRST - Regra de Ouro para Testes**

- **Fast** - Testes devem ser rápidos
- **Independent** - Não dependem uns dos outros
- **Repeatable** - Rodam sempre o mesmo resultado
- **Self-checking** - Verificam a si mesmos
- **Timely** - Escritos no tempo certo (TDD)

### 2. **AAA Pattern - Arrange, Act, Assert**

```typescript
test('should increment counter when button clicked', () => {
  // ARRANGE - Preparar dados e componentes
  const { getByRole } = render(<Counter />)
  const button = getByRole('button')

  // ACT - Executar ação
  fireEvent.click(button)

  // ASSERT - Verificar resultado
  expect(button).toHaveTextContent('1')
})
```

### 3. **Naming Convention**

```typescript
// ❌ Ruim
test('renders')
test('works')
test('check list')

// ✅ Bom
test('should render button with correct text')
test('should increment counter by one when clicked')
test('should filter artist list when search term changes')
```

## 🧪 Testes Unitários

### Componentes Simples

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('should render button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})
```

### Componentes com Props

```typescript
test('should render button with variant', () => {
  const { rerender } = render(<Button variant="primary">Primary</Button>)
  expect(screen.getByRole('button')).toHaveClass('bg-primary')

  rerender(<Button variant="secondary">Secondary</Button>)
  expect(screen.getByRole('button')).toHaveClass('bg-secondary')
})
```

### Componentes com Eventos

```typescript
test('should call onClick when button clicked', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click</Button>)

  fireEvent.click(screen.getByRole('button'))
  
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

## 🔗 Testes de Integração

### Múltiplos Componentes

```typescript
test('should display user profile after login', async () => {
  const { getByRole, getByText } = render(<App />)

  // Usuário faz login
  fireEvent.change(getByRole('textbox', { name: /email/i }), {
    target: { value: 'test@example.com' }
  })
  fireEvent.click(getByRole('button', { name: /login/i }))

  // Aguarda dashboard apareceu
  await waitFor(() => {
    expect(getByText(/bem-vindo/i)).toBeInTheDocument()
  })
})
```

### Form Completo

```typescript
test('should submit form with valid data', async () => {
  const onSubmit = jest.fn()
  const { getByRole } = render(<ArtistForm onSubmit={onSubmit} />)

  fireEvent.change(getByRole('textbox', { name: /name/i }), {
    target: { value: 'Test Artist' }
  })
  fireEvent.click(getByRole('button', { name: /submit/i }))

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test Artist'
    })
  })
})
```

## 🎣 Testes de Hooks

### Hook de Estado

```typescript
test('should increment counter', () => {
  const { result } = renderHook(() => useCounter(0))

  expect(result.current.count).toBe(0)

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)
})
```

### Hook com Efeito

```typescript
test('should fetch data on mount', () => {
  const mockFetch = jest.fn().mockResolvedValue({ data: ['item1'] })

  renderHook(
    () => useArtists(),
    { wrapper: ({ children }) => <Provider>{children}</Provider> }
  )

  expect(mockFetch).toHaveBeenCalled()
})
```

## 📡 Testes de Serviços/APIs

### Mocking API Calls

```typescript
jest.mock('@/lib/api-client')

test('should fetch artists list', async () => {
  const mockData = [{ id: '1', name: 'Artist' }]
  ;(apiClient.get as jest.Mock).mockResolvedValue(mockData)

  const result = await artistsService.getAll()

  expect(result).toEqual(mockData)
  expect(apiClient.get).toHaveBeenCalledWith('/artists')
})
```

### Tratamento de Erros

```typescript
test('should handle API error', async () => {
  const error = new Error('API Error')
  ;(apiClient.get as jest.Mock).mockRejectedValue(error)

  await expect(artistsService.getAll()).rejects.toThrow('API Error')
})
```

## 🌐 Testes E2E

### Fluxo Completo de Usuário

```typescript
test('should search for artists and view profile', async ({ page }) => {
  // 1. Navegar para página de artistas
  await page.goto('/artists')

  // 2. Buscar por artista
  await page.fill('input[placeholder="Pesquise"]', 'rock')
  await page.waitForTimeout(500) // Wait for debounce

  // 3. Verificar resultados
  const firstCard = page.locator('[class*="card"]').first()
  await expect(firstCard).toBeVisible()

  // 4. Clicar no perfil
  await firstCard.locator('a').click()

  // 5. Verificar página de detalhe
  await expect(page).toHaveURL(/\/artists\//)
})
```

### Login E2E

```typescript
test('should login and access dashboard', async ({ page }) => {
  // 1. Ir para login
  await page.goto('/login')

  // 2. Preencher credenciais
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')

  // 3. Fazer login
  await page.click('button:has-text("Entrar")')

  // 4. Verificar redirecionamento
  await expect(page).toHaveURL('/dashboard')
  
  // 5. Verificar conteúdo do dashboard
  await expect(page.locator('text=Bem-vindo')).toBeVisible()
})
```

## 🛠️ Usando Mock e Fixtures

### Mock de Dados

```typescript
// usuarios.mock.ts
export const mockArtists = [
  {
    id: '1',
    name: 'Artist 1',
    genre: 'Rock'
  },
  {
    id: '2',
    name: 'Artist 2',
    genre: 'Jazz'
  }
]

// No teste:
import { mockArtists } from './usuarios.mock'

test('should render artists', () => {
  ;(apiClient.get as jest.Mock).mockResolvedValue(mockArtists)
  // ...
})
```

### Context/Fixtures para E2E

```typescript
// playwright.setup.ts
export async function createAuthenticatedPage({ page }) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button:has-text("Entrar")')
  await page.waitForURL('/dashboard')
  return page
}

// No teste:
test('should show dashboard', async ({ page }) => {
  const authenticatedPage = await createAuthenticatedPage({ page })
  await expect(authenticatedPage.locator('h1')).toContainText('Bem-vindo')
})
```

## 🚫 Armadilhas Comuns

### ❌ Evitar

```typescript
// Muito específico
test('should have class "btn btn-primary"', () => {
  expect(element).toHaveClass('btn btn-primary')
})

// Muito genérico
test('renders', () => {
  expect(component).toBeDefined()
})

// Testar implementação interna
test('should update state', () => {
  expect(component.state.count).toBe(1)
})

// Sem preparação clara
test('it works', () => {
  render(<Component />)
  // ???
})
```

### ✅ Preferir

```typescript
// Testando comportamento
test('should display "Save" button', () => {
  expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
})

// Específico no comportamento
test('should open modal when edit clicked', () => {
  fireEvent.click(screen.getByRole('button', { name: /edit/i }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

// Testando resultado, não implementação
test('should increment by 1 when clicked', () => {
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

## 📊 Debug de Testes

### Ver o que foi renderizado

```typescript
const { debug } = render(<Component />)
debug() // Imprime o HTML renderizado no console
```

### Encontrar elementos

```typescript
const { getByRole, getByText, getByTestId, getByLabelText } = render(<Component />)

// Preferir nesta ordem:
getByRole('button', { name: /submit/i }) // ✅ Melhor
getByLabelText('Name') // ✅ Bom
getByTestId('submit-btn') // ⚠️ Último recurso
getByText('Hello') // ⚠️ Para texto somente
```

### Debugging com userEvent

```typescript
import userEvent from '@testing-library/user-event'

test('should type in input', async () => {
  const user = userEvent.setup()
  render(<input />)

  const input = screen.getByRole('textbox')
  
  // Simula digitação realista
  await user.type(input, 'test')
  
  expect(input).toHaveValue('test')
})
```

## 🎓 Recursos Úteis

- 📖 [Jest Documentation](https://jestjs.io)
- 🧪 [React Testing Library](https://testing-library.com/react)
- 🎭 [Playwright Docs](https://playwright.dev)
- 💡 [Kent C. Dodds Blog](https://kentcdodds.com)
- 🏆 [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## ✅ Checklist de Qualidade

Antes de commitar código:

- [ ] Todos os testes passam localmente (`npm test`)
- [ ] Cobertura de código é 50%+ (`npm test -- --coverage`)
- [ ] Sem `console.log` ou `console.error` no código
- [ ] Nomes de testes descrevem o comportamento
- [ ] Mocks estão limpos entre testes
- [ ] Sem dependências entre testes
- [ ] Testes E2E críticos passam (`npm run test:e2e`)

---

**Dúvidas? Consulte a documentação em TESTING.md**
