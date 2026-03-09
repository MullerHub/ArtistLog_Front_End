# 🔓 CORS Configuration Fix

## Problema
Backend (Render) está rejeitando requisições do frontend (Vercel) porque o CORS só aceita `http://localhost:3000`.

## Teste de Diagnóstico
```bash
# ✅ Endpoint funciona sem /api
curl https://artistlog-backend-latest.onrender.com/artists
# Retorna: [{"id":"...", "email":"...", }]

# ❌ CORS bloqueado de domínios diferentes
# CORS Allow-Origin: http://localhost:3000 (HARDCODED)
```

---

## Solução: Atualizar Backend CORS

### Opção 1: Backend (Go/Gin) - Mais Seguro ✅

Localize o arquivo de middleware CORS no backend Go:

```go
// main.go ou middleware/cors.go
import "github.com/gin-contrib/cors"

// ❌ ANTES (hardcoded)
c.AllowOrigins = []string{"http://localhost:3000"}

// ✅ DEPOIS (dinâmico por ambiente)
allowedOrigins := []string{
    "http://localhost:3000",           // desenvolvimento local
    "http://localhost:3001",           // alternativo
    "https://artistlog.vercel.app",    // produção (seu frontend)
    "https://*.vercel.app",            // preview deployments
}

config := cors.Config{
    AllowOrigins: allowedOrigins,
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
    AllowHeaders:     []string{"Content-Type", "Authorization"},
    ExposeHeaders:    []string{"Content-Length"},
    AllowCredentials: true,
    MaxAge:           12 * time.Hour,
}

engine.Use(cors.New(config))
```

Ou usar variável de ambiente:

```go
// Ler do .env
import "os"

allowedOrigins := []string{
    os.Getenv("CORS_ALLOWED_ORIGINS"), // ex: "https://artistlog.vercel.app,http://localhost:3000"
}
```

### Opção 2: Variável de Ambiente no Render 🌐

1. Ir para [Render Dashboard](https://dashboard.render.com)
2. Selecionar seu backend service
3. **Environment** → **Add Environment Variable**

```
Name:  CORS_ALLOWED_ORIGINS
Value: https://artistlog.vercel.app,http://localhost:3000,https://*.vercel.app
```

4. Redeploy do serviço (automaticamente)

---

## Checklist para Deploy

- [ ] **Backend**: Atualizar CORS com domínio da Vercel
- [ ] **Environment Variable**: `CORS_ALLOWED_ORIGINS` configurada no Render
- [ ] **Redeploy**: Fazer deploy do backend após alterações
- [ ] **Frontend**: Variável `NEXT_PUBLIC_API_URL` já está configurada ✅
- [ ] **Teste**: Abrir DevTools (F12) e verificar Network

---

## Teste Final

Depois de atualizar backend:

```bash
# No seu frontend (browser console)

// ✅ Deve retornar dados sem erro CORS
fetch('https://artistlog-backend-latest.onrender.com/artists')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))

# ✅ Deve funcionar login
fetch('https://artistlog-backend-latest.onrender.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Próximas Ações

1. **Contato Backend Developer**: "CORS está bloqueando Vercel"
2. **Mensagem**: "Adicione `https://artistlog.vercel.app` e `https://*.vercel.app` aos origins"
3. **Após fix**: Redeploy será necessário
4. **Validação**: Recarregar frontend e verificar Network tab

---

## Referências úteis

- [Go Gin CORS](https://github.com/gin-contrib/cors)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Render Docs: CORS](https://render.com/docs/web-services)

