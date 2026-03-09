# 🔧 Scripts ArtistLog Frontend

Esta pasta contém todos os scripts de automação e utilitários do projeto.

## 📋 Scripts Disponíveis

### 🚀 Deploy

#### `pre-deploy-check.sh`
Validação automática antes do deploy. Verifica:
- Build de produção funciona
- Arquivos essenciais existem  
- Git está limpo (sem mudanças uncommitadas)
- Versões de Node/npm compatíveis

```bash
./scripts/pre-deploy-check.sh
```

**Quando usar:** Sempre antes de fazer push para produção

---

### 🧪 Testes

#### `run-tests-local.sh`
Roda todos os testes (unit + E2E) com mocks locais.

```bash
./scripts/run-tests-local.sh
```

**Quando usar:** Desenvolvimento diário, CI/CD

---

#### `run-tests-real.sh`
Roda todos os testes E2E contra backend real.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080 ./scripts/run-tests-real.sh
```

**⚠️ Cuidado:** Backend tem rate limit (5 logins/15min). Use `--workers=1` e aguarde entre rodadas.

**Quando usar:** Validação antes de deploy, testes de integração completos

---

#### `run-e2e-real.sh`
Roda somente testes E2E (sem unit tests) contra backend real.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080 ./scripts/run-e2e-real.sh
```

**Quando usar:** Quando só precisa validar fluxos E2E

---

#### `run-exact-location-tests.sh`
Roda testes E2E específicos de busca por localização.

```bash
./scripts/run-exact-location-tests.sh
```

**Quando usar:** Validar feature de geolocalização e busca por raio

---

### 🛠️ Desenvolvimento

#### `dev.sh`
Script de desenvolvimento que limpa cache e inicia servidor Next.js.

```bash
./scripts/dev.sh
```

**Quando usar:** Quando `npm run dev` está com problemas de cache

---

#### `find-port.mjs`
Utilitário Node.js que encontra uma porta disponível automaticamente.

```bash
node scripts/find-port.mjs
```

**Usado por:** `npm run dev` (chamado automaticamente)

---

#### `dev` (executável)
Script auxiliar para desenvolvimento.

```bash
./scripts/dev
```

---

## 🎯 Fluxos Comuns

### Desenvolvimento Local
```bash
# Iniciar servidor
npm run dev

# Testes em watch mode
npm run test:watch

# Se der problema de cache
./scripts/dev.sh
```

### Antes de Commitar
```bash
# Validação completa
./scripts/pre-deploy-check.sh

# Ou manual:
npm run build
npm test
npm run lint
```

### Testes Completos
```bash
# Testes locais (rápido)
./scripts/run-tests-local.sh

# Testes com backend real (aguardar 15min entre rodadas)
NEXT_PUBLIC_API_URL=http://localhost:8080 ./scripts/run-tests-real.sh
```

### Deploy para Produção
```bash
# 1. Validar
./scripts/pre-deploy-check.sh

# 2. Commit
git add .
git commit -m "feat: sua feature"

# 3. Push (deploy automático na Vercel)
git push origin main
```

## 🔒 Permissões

Todos os scripts `.sh` devem ser executáveis:

```bash
chmod +x scripts/*.sh
```

Se algum script não executar, verifique as permissões:

```bash
ls -la scripts/
```

## 📝 Criando Novos Scripts

Ao criar um novo script:

1. **Coloque em `/scripts`** - Mantenha a raiz limpa
2. **Adicione shebang** - `#!/bin/bash` ou `#!/usr/bin/env node`
3. **Documente aqui** - Adicione seção explicando uso
4. **Torne executável** - `chmod +x scripts/seu-script.sh`
5. **Atualize .gitignore** - Se gera arquivos temporários

## 🆘 Troubleshooting

### Script não executa
```bash
# Verificar permissões
ls -la scripts/nome-do-script.sh

# Tornar executável
chmod +x scripts/nome-do-script.sh

# Executar com bash diretamente
bash scripts/nome-do-script.sh
```

### Rate limit em testes E2E
```bash
# Limpar cache de sessão
rm /tmp/artistlog-e2e-session-cache.json

# Aguardar 15 minutos entre rodadas
# Usar --workers=1 para evitar múltiplos logins simultâneos
npx playwright test --workers=1
```

### Erro de porta em uso
```bash
# find-port.mjs encontra porta disponível automaticamente
# Se precisar porta específica:
PORT=3001 npm run dev
```

## 📚 Documentação Relacionada

- **Deploy:** `../docs/DEPLOYMENT.md`
- **Testes:** `../docs/TESTING.md`
- **Índice completo:** `../docs/DOCS_INDEX.md`

---

**Última atualização:** 9 de março de 2026  
**Versão:** MVP v1.0  

**Dúvidas?** Consulte a [documentação completa](../docs/README.md)
