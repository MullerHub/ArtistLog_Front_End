# 🎵 ArtistLog Frontend - Guia de Integração

## 📋 Status da Integração

✅ **Concluído:**
- Frontend estrutura base com Next.js 16 + App Router
- Autenticação (Login/Register) integrada
- Tipos TypeScript completos do Swagger
- API Client funcional com middlewares
- Services para todos os endpoints
- Páginas principais:
  - Dashboard (Artista/Venue)
  - Listagem de Artistas
  - Detalhes do Artista
  - Gestão de Agenda (Artista)
  - Listagem de Venues
  - Detalhes da Venue
  - Perfil do Usuário (Edit)
- Componentes principais
- Proteção de rotas autenticadas

---

## 🚀 Configuração Rápida

### 1. Instalar Dependências
```bash
cd frontend
pnpm install  # ou npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copy the example file
cp .env.local.example .env.local

# Editar .env.local se necessário (padrão: http://localhost:8080)
```

### 3. Verificar Backend Rodando
```bash
# Em outro terminal, na raiz do projeto
make dev  # ou: go build -o tmp/api ./cmd/api && ./tmp/api
```

### 4. Iniciar Frontend
```bash
cd frontend
pnpm dev  # ou npm run dev
```

A aplicação estará em: **http://localhost:3000**

---

## 📁 Estrutura de Pastas

```
frontend/
├── app/
│   ├── login/                    # Página de login
│   ├── register/                 # Página de registro
│   └── (protected)/              # Rotas autenticadas
│       ├── dashboard/            # Dashboard principal
│       ├── artists/              # Listagem de artistas
│       │   └── [id]/            # Detalhes do artista
│       ├── venues/               # Listagem de venues
│       │   └── [id]/            # Detalhes da venue
│       ├── schedule/             # Gestão de agenda (artista)
│       ├── profile/              # Edição de perfil
│       └── layout.tsx            # Layout com proteção
├── components/
│   ├── cards/                    # Componentes de cards
│   ├── ui/                       # Componentes UI base
│   └── ProtectedLayout.tsx       # Wrapper de proteção
├── lib/
│   ├── api-client.ts            # Cliente HTTP (fetch)
│   ├── auth-context.tsx         # Context de autenticação
│   ├── types.ts                 # Tipos TypeScript (do Swagger)
│   ├── formatters.ts            # Funções de formatação
│   ├── utils.ts                 # Utilitários gerais
│   └── services/                # Services para cada feature
│       ├── auth.service.ts      # Autenticação
│       ├── artists.service.ts   # API de artistas
│       ├── venues.service.ts    # API de venues
│       ├── schedules.service.ts # API de agendas
│       └── location.service.ts  # API de localização
└── hooks/
    ├── use-auth.ts              # Hook de autenticação
    └── use-debounce.ts          # Hook de debounce
```

---

## 🔌 Endpoints Integrados

### ✅ Autenticação
- `POST /auth/login` → Login
- `POST /auth/signup/artist` → Registro Artista
- `POST /auth/signup/venue` → Registro Venue
- `GET /auth/me` → Usuário Autenticado

### ✅ Artistas
- `GET /artists` → Listar Artistas (com filtros)
- `GET /artists/{id}` → Detalhes do Artista
- `PATCH /artists/{id}` → Atualizar Perfil
- `PATCH /artists/{id}/availability` → Mudar Disponibilidade
- `POST /artists/{id}/location` → Atualizar Localização

### ✅ Venues
- `GET /venues` → Listar Venues
- `GET /venues/{id}` → Detalhes da Venue
- `PATCH /venues/{id}` → Atualizar Perfil
- `GET /venues/{id}/reviews` → Reviews da Venue
- `POST /venues/{id}/reviews` → Criar Review
- `GET /venues/{id}/available-artists` → Artistas Disponíveis

### ✅ Agendas
- `GET /artists/me/schedule` → Minha Agenda (Artista)
- `GET /artists/{id}/schedule` → Agenda do Artista (público)
- `POST /artists/{id}/schedule` → Criar Agenda
- `PATCH /artists/me/schedule` → Atualizar Agenda
- `POST /artists/me/schedule/slots` → Adicionar Slot
- `DELETE /artists/{id}/schedule/slots/{slotId}` → Remover Slot

### ✅ Localização
- `GET /cities/search` → Buscar Cidades
- `PATCH /me/location` → Atualizar Minha Localização

### ✅ Upload
- `POST /upload/photo` → Upload de Foto

---

## 🎯 Fluxo de Uso

### Para Artista:
1. **Registrar** → `/register` (ARTIST)
2. **Login** → `/login`
3. **Dashboard** → `/dashboard`
4. **Completar Perfil** → `/profile`
5. **Adicionar Agenda** → `/schedule`
6. **Explorar Venues** → `/venues`
7. **Ver Detalhes** → `/venues/{id}`

### Para Venue:
1. **Registrar** → `/register` (VENUE)
2. **Login** → `/login`
3. **Dashboard** → `/dashboard`
4. **Completar Perfil** → `/profile`
5. **Buscar Artistas** → `/artists`
6. **Ver Detalhes** → `/artists/{id}`
7. **Ver Agendas** → Integrado na página de artista

---

## 🔐 Autenticação & Segurança

### Como Funciona:
1. **Login**: Envia `email/password` → Recebe `JWT token`
2. **Armazena**: Token em `localStorage` como `artistlog_token`
3. **Headers**: JWT incluído em todas requisições protegidas
4. **401 Handling**: Se token expirado → redireciona para `/login`
5. **Logout**: Remove token e user do localStorage

### AuthContext
- Gerencia estado global do usuário
- Disponível via hook `useAuth()`
- Fornece: `user`, `login()`, `logout()`, `isLoading`, `isAuthenticated`

```typescript
const { user, login, logout, isAuthenticated } = useAuth()
```

---

## 📝 Tipos TypeScript

Todos os tipos foram extraídos do `swagger.json`:

```typescript
// Auth
interface LoginRequest { email, password }
interface AuthResponse { access_token, expires_in, user }
interface UserResponse { id, email, role, created_at, updated_at }

// Artist
interface ArtistResponse { id, stage_name, bio, cache_base, is_available, rating, tags, ... }
interface ArtistListResponse { items, total, limit, offset }

// Venue
interface VenueResponse { id, venue_name, capacity, infrastructure, rating, ... }
interface VenueListResponse { items, total, limit, offset }

// Schedule
interface ScheduleResponse { id, artist_id, min_gig_duration, slots, ... }
interface SlotResponse { id, day_of_week, start_time, end_time, is_booked }

// Review
interface ReviewResponse { id, venue_id, author_id, rating, comment, ... }

// Location
interface City { name, state, latitude, longitude }
interface GeoPoint { latitude, longitude }

// + muitos mais em lib/types.ts
```

---

## 🔧 Personalizações Necessárias

### 1. Componentes UI
Se não encontrar componentes como `Button`, `Input`, `Card`, etc:
```bash
# Instalar componentes Shadcn
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### 2. Notificações (Sonner)
Já integrado via `toast()`. Teste com:
```typescript
import { toast } from "sonner"
toast.success("Sucesso!")
toast.error("Erro!")
```

### 3. Tema (Tailwind)
Configurado em `tailwind.config.ts` com cores personalizadas.

---

## 🚀 Próximos Passos

1. **Melhorias de UX**
   - Loading skeletons nas listagens
   - Infinite scroll ao invés de "Load More"
   - Busca em tempo real (debounced)
   - Filtros avançados

2. **Novas Features**
   - Sistema de contratos/propostas (when backend ready)
   - Upload de fotos de perfil
   - Mapa de venues próximas
   - Chat/Mensagens entre artista-venue
   - Notificações em tempo real

3. **Melhorias de Performance**
   - Cache local com React Query
   - Lazy loading de imagens
   - Code splitting automático

4. **Testes**
   - Testes unitários (Jest)
   - Testes de integração (Testing Library)
   - E2E tests (Playwright/Cypress)

---

## ❓ Troubleshooting

### Erro: "CORS error"
- Verificar se backend está rodando em `localhost:8080`
- Verificar `.env.local` tem `NEXT_PUBLIC_API_URL=http://localhost:8080`

### Erro: "Unauthorized (401)"
- Token expirou → fazer logout e login novamente
- Verificar se token está sendo salvo em localStorage
- Verificar Network tab para ver se header `Authorization` está sendo enviado

### Erro: "Cannot find module"
- Rodar `pnpm install` novamente
- Limpar `.next` folder: `rm -rf .next && pnpm dev`

### Página em branco após login
- Verificar se dashboard layout está correto
- Verificar AuthContext está envolvendo a app

---

## 📞 Contato & Suporte

Qualquer dúvida sobre integração, favor consultar:
1. [`IA_Context/SWAGGER_AI_GUIDE.md`](../IA_Context/SWAGGER_AI_GUIDE.md)
2. Swagger da API em `http://localhost:8080/swagger/`
3. Tests do backend em `/tests/`

---

## ✅ Checklist de Validação

- [ ] Backend rodando em `localhost:8080`
- [ ] Frontend rodando em `localhost:3000`
- [ ] Login/Register funcionando
- [ ] Artistas listam corretamente
- [ ] Venues listam corretamente
- [ ] Agenda salvando slots
- [ ] Perfil editável
- [ ] Logout redireciona para login
- [ ] Páginas protegidas redireciona se não autenticado

---

**Last Updated**: 2026-02-08  
**Status**: ✅ Production Ready
