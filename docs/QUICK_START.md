# 🚀 ArtistLog Frontend - Quick Start Guide

## Para Desenvolvedores

### Setup Local (5 minutos)

```bash
# 1. Clone repositório
git clone https://github.com/MullerHub/ArtistLog_Front_End.git
cd ArtistLog_Front_End

# 2. Instalar dependências
npm install

# 3. Configurar env
cp .env.local.example .env.local
# Editar com valores locais (ver .env.local.example)

# 4. Iniciar dev server
npm run dev

# 5. Abrir http://localhost:3000
```

### Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **UI**: Shadcn/ui + Tailwind CSS
- **Fetching**: SWR (React Query)
- **Testes**: Jest + Playwright
- **Maps**: Mapbox GL
- **Auth**: JWT Token

### Arquitetura Básica

```
app/                      # Rotas Next.js (App Router)
├── (protected)/          # Rotas autenticadas
│   ├── dashboard/
│   ├── contracts/
│   ├── artists/
│   └── venues/
├── login/
├── register/
└── layout.tsx

components/               # Componentes React
├── ui/                   # Shadcn UI components
├── notification-center.tsx
├── artist-card.tsx
└── ...

lib/                      # Lógica compartilhada
├── api-client.ts         # HTTP client centralizado
├── auth-context.tsx      # Context para auth
├── services/             # API integration
│   ├── artists.service.ts
│   ├── contracts.service.ts
│   ├── notifications.service.ts
│   └── ...
└── types.ts              # TypeScript types

hooks/                    # Custom React hooks
├── use-debounce.ts
├── use-mobile.tsx
└── ...

e2e/                      # Testes Playwright
├── auth.spec.ts
├── navigation.spec.ts
└── ...
```

### Padrões Principais

#### API Calls
```typescript
// Usar services em lib/services/*
import { artistsService } from '@/lib/services'

const { data, isLoading, error } = useSWR(
  '/artists',
  () => artistsService.getAll()
)
```

#### Error Handling
```typescript
import { toast } from 'sonner'
import { ApiError } from '@/lib/api-client'

try {
  await artistsService.update(id, data)
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message)
  }
}
```

#### Componentes UI
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Button>Clique aqui</Button>
      </CardContent>
    </Card>
  )
}
```

### Comandos Úteis

```bash
# Development
npm run dev              # Inicia servidor (http://localhost:3000)

# Build
npm run build            # Build production
npm start                # Inicia servidor de produção

# Testing
npm test                 # Testes unitários
npm run test:e2e         # Todos os testes E2E
npm run test:e2e:smoke   # Testes E2E rápidos (auth + nav)

# Quality
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript

# Build analysis
npm run build -- --analyze  # Bundle size
```

### Environment Variables

`.env.local.example`:
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Maps (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN=xxx

# Nomatinim (Geocoding)
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org

# WebSocket (optional)
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
```

### Fluxo de Features

1. **Criar tipos** em `lib/types.ts`
2. **Criar service** em `lib/services/feature.service.ts`
3. **Criar componentes** em `components/`
4. **Integrar em rota** em `app/(protected)/feature/page.tsx`
5. **Adicionar testes** em `e2e/feature.spec.ts` (se crítico)
6. **Documentar** em `.github/instructions/`

### Debugging

```typescript
// Logs estruturados
console.log('[ModuleName] action', { userId, data })

// Dev tools do Browser
// - React DevTools (chrome://extensions)
// - Network tab (ver requests/responses)
// - Console para error checking

// Verificar localStorage
localStorage.getItem('artistlog_user')
localStorage.getItem('artistlog_token')
```

### Resolver Problemas Comuns

#### "Cannot find module"
```bash
rm -rf node_modules .next
npm install
npm run dev
```

#### "API não responde"
1. Verificar `NEXT_PUBLIC_API_URL` está correto
2. Confirmar backend está rodando
3. Checar network tab do browser

#### "Estilos não estão aplicando"
1. Rebuild: `npm run build`
2. Limpar cache: `rm -rf .next`
3. Restart dev server

#### "Token expirado"
- Não é problema de código, redireciona para login automaticamente
- Verificar localStorage se token está salvo

### Performance Tips

- Use `next/image` para imagens
- Implement code splitting automático
- SWR faz cache automático
- Evitar re-renders com `useMemo`/`useCallback`
- Use `data-testid` em E2E tests para stability

### Deployment

Ver: [DEPLOYMENT.md](./DEPLOYMENT.md)

**TL;DR**:
1. Build: `npm run build`
2. Deploy: `vercel --prod` (ou Docker)
3. Monitor: Watch error logs first 24h

### Contribuindo

1. Feature branch: `git checkout -b feature/xyz`
2. Código: Siga padrões do projeto
3. Testes: `npm test`
4. Build: `npm run build` (deve passar)
5. PR: Descreva mudanças
6. Review: Aguarde aprovação

### Recursos

- **Docs**: `.github/instructions/`
- **API**: `INTEGRATION_GUIDE.md`
- **Testing**: `TESTING.md`
- **Deploy**: `DEPLOYMENT.md`
- **Status**: `MVP_STATUS_REPORT.md`

### Suporte

- Issues: GitHub Issues
- Docs: Wiki
- Backend: Veja Backend Repo

---

**Versão**: MVP v1.0 - 2026-03-04  
**Pronto para contribuir?** 🚀
