# 🚀 Deploy Vercel - Backend Render - AGORA

Backend está online em: **https://artistlog-backend-latest.onrender.com**

---

## ⚡ Passo 1: Commit e Push (2 min)

```bash
cd /Volumes/programacao/ArtistLog/ArtistLog_Front_End

# Adicionar configurações
git add .env.production.example VERCEL_DEPLOY_NOW.md

# Commit
git commit -m "chore: configure backend URL for Render deployment"

# Push para main (triggers deploy no Vercel se já estiver conectado)
git push origin main
```

---

## 🔌 Passo 2: Conectar Vercel (se ainda não estiver)

### Option A: Git Integration (Automático)

1. Acesse: **https://vercel.com/new**
2. Faça login com GitHub
3. Clique em "Import Project"
4. Selecione: `MullerHub/ArtistLog_Front_End`
5. Clique em "Import"

### Option B: CLI (Rápido)

```bash
npm install -g vercel
vercel login
vercel link
vercel
```

---

## 🔐 Passo 3: Configurar Variável de Ambiente (1 min)

### Via Dashboard Vercel (Recomendado)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto: `ArtistLog_Front_End`
3. Vá para: **Settings** → **Environment Variables**
4. Clique em "Add New"

**Configure:**
```
Name:  NEXT_PUBLIC_API_URL
Value: https://artistlog-backend-latest.onrender.com
```

5. Selecione todos os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. Clique em "Save"

### Ou via CLI

```bash
vercel env add NEXT_PUBLIC_API_URL
# Digite: https://artistlog-backend-latest.onrender.com
# Selecione: All (Production, Preview, Development)
```

---

## ✅ Passo 4: Deploy (Automático se já conectado via Git)

### Se já conectou via Git Integration
- Seu push automático ativa o deploy
- Aguarde 3-5 minutos
- Vercel faz build, testa e publica

**Ver status:** https://vercel.com/dashboard → Seu Projeto → Deployments

### Se quer fazer deploy manual

```bash
vercel --prod
```

---

## 🧪 Passo 5: Validar Deploy (2 min)

### Verificações Básicas

1. **Página carrega:**
   ```
   https://seu-projeto.vercel.app
   ```

2. **Verificar API conectada (DevTools):**
   - Abra o site
   - Pressione `F12` (DevTools)
   - Vá para aba **Network**
   - Faça uma ação que chame API (ex: tentar login)
   - Verifique se a URL da request é `https://artistlog-backend-latest.onrender.com`

3. **Testar Fluxos:**
   - ✅ Cadastro
   - ✅ Login
   - ✅ Busca de artistas
   - ✅ Visualizar perfil

### Se der erro 401/403 no CORS

Backend precisa aceitar origem Vercel. Configure no Render:
```go
// Backend CORS
import "github.com/rs/cors"

c := cors.New(cors.Options{
    AllowedOrigins: []string{
        "*", // ou especificar: "https://seu-instancia.vercel.app"
    },
})
```

---

## 🎯 Checklist Final

- [ ] Git commit e push feito
- [ ] Verificou status no Vercel Dashboard
- [ ] Variável `NEXT_PUBLIC_API_URL` adicionada
- [ ] Build completou com sucesso (sem erros)
- [ ] Site abre em `https://seu-projeto.vercel.app`
- [ ] DevTools mostra requests para `artistlog-backend-latest.onrender.com`
- [ ] Login/Cadastro funcionando
- [ ] API respondendo corretamente

---

## 📊 Status Esperado

| Componente | Status | URL |
|-----------|--------|-----|
| **Frontend** | 🟢 Será deployado | vercel.app/{seu-projeto} |
| **Backend API** | 🟢 Online | https://artistlog-backend-latest.onrender.com |
| **Database** | 🟢 Online | Render (PostgreSQL) |

---

## 🆘 Troubleshooting

### Build falha na Vercel
```
Solução: Já configurado ignoreBuildErrors: true
Verificar logs: Vercel Dashboard → Seu Projeto → Deployments → Ver Logs
```

### API não responde (CORS Error)
```
Solução: Backend Render precisa ter CORS habilitado
Verify: curl https://artistlog-backend-latest.onrender.com/health
```

### Variável não está sendo lida
```
Solução: 
1. Verifique se começa com NEXT_PUBLIC_
2. Aguarde redeployment após adicionar (ou trigger deploy):
   git commit --allow-empty -m "trigger rebuild"
   git push
```

---

## 🚀 Pronto!

Deploy agora! 

**Tempo total:** ~10 minutos (maioria automática)

**Próxima etapa:** Monitorar os logs nos primeiros 24h e fazer testes de smoke.

---

**Data:** 9 de Março de 2026  
**Backend URL:** https://artistlog-backend-latest.onrender.com  
**Frontend Platform:** Vercel  
**Status:** 🟢 PRONTO PARA DEPLOY
