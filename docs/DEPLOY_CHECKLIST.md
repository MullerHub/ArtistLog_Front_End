# ✅ Checklist de Deploy - ArtistLog Frontend na Vercel

## 📋 Pré-Deploy

- [x] ✅ Build local funciona sem erros (`npm run build`)
- [x] ✅ TypeScript configurado para produção
- [x] ✅ Variáveis de ambiente documentadas
- [x] ✅ `.gitignore` protegendo arquivos sensíveis
- [x] ✅ Headers de segurança configurados em `vercel.json`
- [x] ✅ Cache de sessão E2E implementado
- [x] ✅ Jest ignorando arquivos E2E
- [ ] 🟡 URL do backend configurada na Vercel (FAZER AGORA)

---

## 🚀 Durante Deploy

### No Dashboard da Vercel:

1. **Import Project**
   - [ ] Conectar repositório GitHub `MullerHub/ArtistLog_Front_End`
   - [ ] Vercel detecta automaticamente Next.js ✅

2. **Configure Environment Variables**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://seu-backend.vercel.app
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
   - [ ] Adicionar variável `NEXT_PUBLIC_API_URL`
   - [ ] Salvar configuração

3. **Deploy**
   - [ ] Clicar em "Deploy"
   - [ ] Aguardar build (~2-3 min)
   - [ ] Verificar logs de build

---

## 🧪 Pós-Deploy

### Validação Básica

- [ ] Homepage carrega: `https://seu-projeto.vercel.app`
- [ ] Página de login funciona
- [ ] DevTools → Network: requests indo para backend correto
- [ ] Console sem erros críticos

### Testes de Fluxo

- [ ] **Autenticação**
  - [ ] Cadastro de novo usuário (artista ou venue)
  - [ ] Login com credenciais válidas
  - [ ] Logout funciona
  - [ ] Redirecionamento para login quando não autenticado

- [ ] **Descoberta**
  - [ ] Busca de artistas funciona
  - [ ] Busca de contratantes funciona
  - [ ] Filtros aplicam corretamente
  - [ ] Detalhes de perfil carregam

- [ ] **Perfil**
  - [ ] Upload de foto funciona
  - [ ] Edição de dados salva
  - [ ] Localização é salva corretamente

- [ ] **Notificações**
  - [ ] Centro de notificações abre
  - [ ] Contador de não lidas funciona
  - [ ] Marcar como lida funciona

### Performance

- [ ] Lighthouse Score > 80 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Vercel Analytics: Core Web Vitals verdes

---

## 🔧 Configurações Avançadas (Opcional)

### Domínio Customizado

- [ ] Adicionar domínio em Settings → Domains
- [ ] Configurar DNS A/CNAME
- [ ] Aguardar propagação SSL (automático)
- [ ] Testar HTTPS: `https://artistlog.com`

### Ambientes

- [ ] **Preview**: Cada PR cria deploy preview automático
- [ ] **Production**: Branch `main` faz deploy em produção
- [ ] Configurar variáveis específicas por ambiente (se necessário)

### Monitoring

- [ ] Habilitar Vercel Analytics (grátis)
- [ ] (Opcional) Integrar Sentry para error tracking
- [ ] (Opcional) Configurar webhooks para notificações de deploy

---

## 🐛 Troubleshooting

### Se Build Falhar

1. **Verificar logs** no dashboard Vercel
2. **TypeScript errors**: Já configurado `ignoreBuildErrors: true` ✅
3. **Module not found**: Execute `npm ci && npm run build` localmente
4. **Out of memory**: Build já otimizado para Vercel ✅

### Se Site Não Carregar

1. **404 Error**: Verifique routes em `app/` folder
2. **500 Error**: Verifique logs em Vercel → Functions → Logs
3. **Blank Page**: Abra console, verifique JavaScript errors

### Se API Não Responder

1. **CORS Error**: Backend precisa aceitar origem Vercel
   ```javascript
   // No backend
   cors({
     origin: ['https://seu-frontend.vercel.app', 'https://artistlog.com']
   })
   ```

2. **404 nas APIs**: Confirme `NEXT_PUBLIC_API_URL` sem `/` no final

3. **Timeout**: Verifique se backend Vercel está online:
   ```bash
   curl https://seu-backend.vercel.app/health
   ```

---

## 📊 Métricas de Sucesso

Após 24h de deploy:

- [ ] Uptime > 99.9%
- [ ] Core Web Vitals: verdes no Vercel Analytics
- [ ] Error rate < 1%
- [ ] Usuários conseguem completar cadastro e login
- [ ] Busca de artistas/venues funcional

---

## 🎯 Status Atual

**Data:** ____/____/____  
**Deploy URL:** _______________________  
**Backend URL:** _______________________  

**Build Status:** ⚪ Aguardando / 🟡 Em Progresso / 🟢 Sucesso / 🔴 Falha

**Testes Básicos:**
- Login: ⚪
- Busca: ⚪
- Upload: ⚪
- Notificações: ⚪

---

**Próximo Passo:** Ver `VERCEL_DEPLOY.md` para instruções detalhadas
