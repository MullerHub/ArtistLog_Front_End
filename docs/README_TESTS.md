# Guia de Testes - ArtistLog Frontend

## 📋 Visão Geral

O projeto possui três tipos de testes:
1. **Testes Unitários** - Serviços e componentes isolados
2. **Testes de Integração** - Fluxos completos com mocks
3. **Testes E2E** - Interface completa com Playwright (requer backend)

## 🧪 Testes Unitários

### Executar todos os testes unitários
```bash
npm test
```

### Executar testes específicos
```bash
# Testes de serviços de contratos
npm test -- lib/services/__tests__/proposals.service.test.ts
npm test -- lib/services/__tests__/messages.service.test.ts
npm test -- lib/services/__tests__/audit.service.test.ts
npm test -- lib/services/__tests__/signature.service.test.ts

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Coverage atual dos serviços
- ✅ **proposalsService**: 7 testes (create, list, accept, reject)
- ✅ **messagesService**: 8 testes (send, list, markAsRead, getUnreadCount)
- ✅ **auditService**: 7 testes (getTrail, listLogs, getUserAudit)
- ✅ **signatureService**: 9 testes (sendForSignature, getStatus, polling)

## 🎭 Testes E2E (End-to-End)

### Pré-requisitos

1. **Instalar browsers do Playwright**
```bash
npx playwright install chromium
```

2. **Backend rodando com dados mockados/seed**
```bash
# API real usada pelos E2E
export NEXT_PUBLIC_API_URL=http://localhost:8080

# Credenciais do usuário de teste existente no backend
export E2E_EMAIL=artist@example.com
export E2E_PASSWORD=password123
```

### Executar testes E2E

#### 🌍 Modo Local (Recomendado para Desenvolvimento)
Usa mocks locais - sempre funciona, não precisa de backend rodando.

```bash
# Rodar testes E2E locais
npm run test:e2e:local

# Interface gráfica
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

#### 🔗 Modo Real (Integração com Backend)
Conecta ao backend real e valida a API de verdade.

```bash
# 1. Certifique-se de que o backend está rodando em http://127.0.0.1:8080
# 2. Configure credenciais de teste no backend (ou use as padrões)
# 3. Rode os testes

export NEXT_PUBLIC_API_URL=http://127.0.0.1:8080
export E2E_EMAIL=artist@example.com
export E2E_PASSWORD=password123

npm run test:e2e:real
```

#### 📊 Todos os Testes E2E (Local + Real)
```bash
npm run test:e2e
```

### Estado Atual dos Testes E2E

#### ✅ Modo Local - Contratos (`e2e/contracts-local.spec.ts`)
- [x] Renderiza card e detalhes do contrato
- [x] Envia proposta via form
- [x] Envia mensagem via chat
- [x] Exibe timeline de auditoria

**Status**: ✅ 4/4 PASSANDO (sempre funciona)

#### ✅ Modo Real - Contratos (`e2e/contracts-real.spec.ts`)
- [x] Renderiza card e detalhes do contrato (dados reais)
- [x] Envia proposta e valida no backend
- [x] Envia mensagem e valida no backend
- [x] Exibe timeline de auditoria

**Status**: ⏳ Aguardando backend rodando em `http://127.0.0.1:8080`



#### ✅ Autenticação (`e2e/auth.spec.ts`)
- [x] Redirecionamento para login
- [x] Formulário de login
- [x] Validação de credenciais
- [x] Link para registro

#### ✅ Navegação (`e2e/navigation.spec.ts`)
- [x] Menu principal
- [x] Links de navegação
- [x] Rotas protegidas

## 🔧 Configuração

### Jest (Testes Unitários)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'lib/services/**/*.ts',
    'components/**/*.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
  ],
}
```

### Playwright (Testes E2E)
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev:turbo',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

## 📊 Estrutura de Testes

```
ArtistLog_Front_End/
├── e2e/                          # Testes E2E (Playwright)
│   ├── auth.spec.ts
│   ├── contracts.spec.ts
│   └── navigation.spec.ts
├── lib/
│   ├── services/
│   │   └── __tests__/           # Testes unitários de services
│   │       ├── audit.service.test.ts
│   │       ├── messages.service.test.ts
│   │       ├── proposals.service.test.ts
│   │       └── signature.service.test.ts
│   └── __tests__/               # Testes de integração
└── components/
    └── __tests__/               # Testes de componentes
```

## 🐛 Troubleshooting

### "Executable doesn't exist" (Playwright)
```bash
npx playwright install
```

### "Port 3000 already in use"
```bash
# Verificar processo
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Testes E2E lentos ou travando
```bash
# Aumentar timeout no playwright.config.ts
use: {
  timeout: 60000, // 60 segundos
}

# Ou executar em modo serial
test.describe.configure({ mode: 'serial' })
```

### Mocks não funcionando nos testes E2E
- Verificar se `page.route()` está antes de `page.goto()`
- Usar padrões de rota corretos: `**/auth/me`, `**/contracts`
- Verificar console do browser: `test-results/.../error-context.md`

## 📈 Próximos Passos

- [ ] Aumentar cobertura de testes para components (target: 80%)
- [ ] Adicionar testes E2E para Artists e Venues
- [ ] Integrar MSW (Mock Service Worker) para mocks mais robustos
- [ ] Configurar CI/CD com GitHub Actions
- [ ] Adicionar testes de acessibilidade (axe-core)
- [ ] Testes de performance com Lighthouse

## 🔗 Links Úteis

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
