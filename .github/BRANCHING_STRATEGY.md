# 🌳 Git Branching Strategy

## Resumo

Trabalhar em branch `develop` ou `feature/*`. Nunca committar direto em `main`.  
`main` ← deploy automático Vercel (sempre estável).

---

## Branches

### 1. `main` (Production)
- **Proteção:** Requer PR + review + testes passando
- **Deploy:** Automático em Vercel (2-3 minutos)
- **Regra:** Apenas merges de `develop` após validação
- **Tag:** Cria releases com `v*` (v1.0.0, v1.0.1, etc.)

```bash
# Nunca editar direto; sempre via PR
git checkout main
git pull origin main
# ❌ NÃO fazer commit aqui
```

### 2. `develop` (Staging/Integration)
- **Propósito:** Base para feature branches, integração contínua
- **Deploy:** Não faz deploy automático (fica em staging)
- **Regra:** Merges de `feature/*` após PR + tests
- **Cadência:** Merge para `main` a cada release

```bash
git checkout develop
git pull origin develop
# ✅ Criar branches daqui para features
```

### 3. `feature/*` (Development)
- **Padrão:** `feature/nome-da-feature`
- **Exemplos:**
  - `feature/artist-discovery`
  - `feature/contract-workflow`
  - `feature/notification-ui`
  - `feature/exact-location-map`
- **Ciclo de vida:**
  1. Criar: `git checkout -b feature/nome develop`
  2. Desenvolver: commits normais
  3. Push: `git push origin feature/nome`
  4. PR para `develop`
  5. Review + testes
  6. Merge: delete a branch

```bash
# Criar feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Desenvolver
git add .
git commit -m "feat: descrição"
git push origin feature/my-feature

# Depois: criar PR no GitHub
# https://github.com/MullerHub/ArtistLog_Front_End/pulls
```

### 4. `hotfix/*` (Urgent Fix)
- **Padrão:** `hotfix/nome-do-bug`
- **Exemplo:** `hotfix/cors-production-issue`
- **Ciclo de vida:**
  1. Branch de `main`
  2. Fix + commit + push
  3. PR para `main` E `develop`
  4. Merge em `main` imediatamente = deploy Vercel
  5. Merge em `develop` para sincronizar

```bash
git checkout main
git pull origin main
git checkout -b hotfix/bug-name

# Fix
git add .
git commit -m "fix: descrição"
git push origin hotfix/bug-name

# PR para main + develop
```

---

## Workflow Diário

### Setup Inicial (1x)
```bash
git clone https://github.com/MullerHub/ArtistLog_Front_End.git
cd ArtistLog_Front_End
git checkout develop
git pull origin develop
```

### Iniciar Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-feature
```

### Desenvolver
```bash
# Editar arquivos, testar local
npm run dev

# Commits regularmente
git add .
git commit -m "feat: descrição curta"
git commit -m "fix: outro ajuste"

# Push regularmente (não esperar terminar tudo)
git push origin feature/nome-feature
```

### Finalizar Feature
```bash
# 1. Sync com develop mais recente
git pull origin develop
# (se houver conflitos, resolve)

# 2. Push final
git push origin feature/nome-feature

# 3. Criar PR no GitHub
#    https://github.com/MullerHub/ArtistLog_Front_End/pulls
#    Base: develop
#    Compare: feature/nome-feature

# 4. Descrever o PR:
#    - O que mudou?
#    - Como testar?
#    - Issues relacionadas (#123)

# 5. Aguardar review + testes

# 6. Merge (botão no GitHub)

# 7. Delete branch (local)
git branch -d feature/nome-feature
git push origin --delete feature/nome-feature
```

---

## Exemplos de Mensagens de Commit

```bash
# Feature nova
git commit -m "feat: add artist discovery filters"

# Bug fix
git commit -m "fix: prevent localhost fallback in production"

# Refactor sem mudança funcional
git commit -m "refactor: simplify api-client error handling"

# Documentação
git commit -m "docs: update branching strategy guide"

# Testes
git commit -m "test: add e2e for login flow"

# Configuração
git commit -m "chore: update jest config"
```

---

## CI/CD Timeline

### Push para `feature/*` ou `develop`
```
0s    → Commit feito
1s    → GitHub receives push
10s   → GitHub Actions (ou CI) inicia
30s   → Testes correm (Jest, Playwright)
2min  → Build Node.js completo
3min  → Resultados no PR
```

### Merge para `main`
```
0s    → Merge feito
1s    → Vercel detecta push em main
10s   → Build Vercel inicia
2min  → Next.js build + deploy
3min  → 🎉 Frontend atualizado em Vercel
```

---

## Regras de Ouro

✅ **DO:**
- Commits pequenos e frequentes
- Mensagens descritivas
- Uma feature por branch
- Testar local antes de push
- Puxar `develop` antes de criar feature
- Revisar o próprio PR antes de pedir review

❌ **DON'T:**
- Pushear direto em `main`
- Branches com nomes genéricos (`fix`, `work`, `temp`)
- 10+ commits sem sincronizar com develop
- Misturar múltiplas features em 1 branch
- Commitar `node_modules`, `.env`, arquivos buildados

---

## Sincronizar Feature com Develop
Se `develop` evoluiu enquanto você trabalha:

```bash
git fetch origin
git rebase origin/develop
# (se houver conflitos, resolve e `git rebase --continue`)
git push -f origin feature/nome-feature
```

Ou simpler (merge):
```bash
git pull origin develop
# resolve conflitos se houver
git push origin feature/nome-feature
```

---

## Deletar Branch Local/Remoto

```bash
# Local apenas
git branch -d feature/nome

# Remoto apenas  
git push origin --delete feature/nome

# Ambos
git branch -d feature/nome
git push origin --delete feature/nome
```

---

## Workflow Recomendado por Dia

```bash
# Morning: Pull latest
git checkout develop
git pull origin develop

# Feature work
git checkout -b feature/something-cool
# ... edit files ...
git commit -m "feat: implementação"
git push origin feature/something-cool

# Mid-day: Sync if needed
git pull origin develop
# (resolve conflitos se houver)
git push origin feature/something-cool

# Evening: Finish feature
git push origin feature/something-feature
# Create PR on GitHub
# → Request review
# → Wait for checks

# Next day after review
git pull origin develop
git push origin feature/something
# Merge PR via GitHub UI
git checkout develop
git pull origin develop  # get merged changes
git branch -d feature/something
git push origin --delete feature/something
```

---

## FAQ

**P: Quando fazer release para `main`?**  
R: Quando todas as features da milestone estão em `develop` + testadas + prontas.  
Comando: `git checkout develop && git checkout -b release/v1.0.0 develop`  
Fazer PR `release/v1.0.0` → `main`, após merge tag como `v1.0.0`.

**P: Vercel redeploy a cada push em `develop`?**  
R: Não, `develop` não tem deploy automático. Só `main` faz deploy.

**P: Posso ver mudanças no navegador enquanto desenvolvo?**  
R: Sim, `npm run dev` serve local (localhost:3000). Não precisa Vercel.

**P: Como trazer feature nova para develop?**  
R: PR no GitHub: `feature/nome` → `develop`.  
GitHub → Pull Requests → New PR → seleciona branches → cria → descrição → submete.

**P: Git push me pediu senha todo dia?**  
R: Use SSH ou token pessoal. Docs: https://docs.github.com/en/authentication

---

## Shortcut Aliases (Optional)

Adicionar ao `.gitconfig` ou `.bash_profile`:

```bash
alias gf='git checkout develop && git pull && git checkout -b feature'
alias gfs='git push origin $(git rev-parse --abbrev-ref HEAD)'
alias gfr='git fetch && git rebase origin/develop'
```

Uso:
```bash
gf my-feature  # cria feature/my-feature
gfs            # push do branch atual
gfr            # sync com develop
```

