# 🔗 Frontend não está consumindo API - Solução

## Problema Identificado: CORS Bloqueado ❌

A aplicação está online na Vercel, **mas o backend só aceita requisições de `http://localhost:3000`**.

### O que testei:
```bash
✅ Backend online: https://artistlog-backend-latest.onrender.com
✅ Endpoints funcionam: /artists, /venues, /auth/login (HTTP 200)
❌ CORS bloqueado: Vercel é outro domínio
```

---

## Como Consertar

### 1️⃣ Informar Backend Developer

Você precisa **contactar quem gerencia o backend** com essa mensagem:

> "Backend CORS está hardcoded para `http://localhost:3000` 🔒
> 
> Adicione nossos domínios de frontend ao allow-list:
> - `https://artistlog.vercel.app` (produção)
> - `https://*.vercel.app` (previews)
> - `http://localhost:3000` (dev local)
>
> Vou aguardar o redeploy."

### 2️⃣ Backend Dev Faz A Alteração

No código Go (main.go ou middleware/cors.go):

```go
// ✅ Adicionar Vercel aos origins permitidos
allowedOrigins := []string{
    "http://localhost:3000",
    "https://artistlog.vercel.app",    // ← ADICIONAR ISSO
    "https://*.vercel.app",             // ← ADICIONAR ISSO
}
```

Ou via variável de ambiente no Render dashboard.

### 3️⃣ Redeploy

Backend dev faz deploy das alterações no Render.

### 4️⃣ Validação

Você recarrega a página da Vercel em um novo browser tab:

```
Abrir DevTools (F12) → Network tab → Tentar fazer login
Se der erro CORS: aparecer erro específico do CORS
Se funcionar: verá requisição com status 200/401/400 (não CORS)
```

---

## Enquanto Isso...

Você pode:
- ✅ Verificar que frontend está online na Vercel
- ✅ Verificar estrutura de componentes
- ✅ Preparar homepage/landing page
- ✅ Documentar features

Deixe comigo:
- 📍 Diagrama do fluxo de erro CORS
- 📍 Script de validação quando estiver fix do

---

## Referências

- 📄 [docs/CORS_FIX.md](./docs/CORS_FIX.md) - Guia técnico completo
- 🔧 [scripts/validate-cors.sh](./scripts/validate-cors.sh) - Script de teste
- 🌐 Seu frontend: `https://artistlog.vercel.app`
- 📦 Seu backend: `https://artistlog-backend-latest.onrender.com`

