# 🚀 Deploy Rápido na Vercel - ArtistLog Frontend

## ⚡ 3 Passos para Deploy

### 1️⃣ Conecte o Repositório

1. Acesse: [https://vercel.com/new](https://vercel.com/new)
2. Faça login com GitHub
3. Selecione o repositório: `MullerHub/ArtistLog_Front_End`
4. Clique em "Import"

### 2️⃣ Configure a Variável de Ambiente

Na tela de configuração do projeto, adicione:

| Name | Value | Environments |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://seu-backend.vercel.app` | Production, Preview, Development |

**⚠️ IMPORTANTE:** Substitua `seu-backend.vercel.app` pela URL real do seu backend na Vercel.

### 3️⃣ Deploy

Clique em **"Deploy"** e aguarde ~2-3 minutos. Pronto! 🎉

---

## 🔧 Configurações Adicionais (Opcional)

### Variáveis Extras (já têm defaults)

```bash
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org
NEXT_PUBLIC_BIGDATACLOUD_URL=https://api.bigdatacloud.net/data/reverse-geocode-client
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### Domínio Customizado

1. **Settings** → **Domains**
2. Adicione seu domínio: `artistlog.com`
3. Configure DNS conforme instruções
4. SSL automático ✅

---

## ✅ Validação Pós-Deploy

Após deploy, teste:

1. **Homepage**: `https://seu-projeto.vercel.app`
2. **Login**: Teste autenticação
3. **API**: Abra DevTools → Network, verifique chamadas para backend
4. **Console**: Sem erros JavaScript

---

## 🆘 Problemas Comuns

### Build Falha
✅ **Já configurado**: TypeScript com `ignoreBuildErrors: true`

### CORS Error
Configure o backend para aceitar origem Vercel:
```javascript
// Backend
cors({
  origin: ['https://seu-frontend.vercel.app']
})
```

### API não responde
- Verifique `NEXT_PUBLIC_API_URL` (sem `/` no final)
- Teste backend diretamente: `curl https://seu-backend.vercel.app/health`

---

## 📱 Próximos Passos

- [ ] Configurar domínio customizado
- [ ] Testar todos os fluxos no ambiente de produção
- [ ] Monitorar Analytics na aba Analytics da Vercel
- [ ] Configurar alertas de erro (Settings → Integrations → Sentry)

---

**Documentação Completa:** Ver `DEPLOYMENT.md`
