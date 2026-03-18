# 🚀 Quick Reference - Daily Commands

## Setup (primeiro dia)
```bash
git clone https://github.com/MullerHub/ArtistLog_Front_End.git
cd ArtistLog_Front_End
git checkout develop
git pull origin develop
npm install
npm run dev  # ver em localhost:3000
```

---

## Iniciar Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-descritivo

# Exemplo
git checkout -b feature/artist-profile-improvements
```

---

## Desenvolvimento Diário
```bash
# Editar arquivos, testar em localhost:3000

# Commit pequenininho
git add .
git commit -m "feat: adicionar filtro de gênero"

# Push (não esperar terminar)
git push origin feature/nome

# Se precisar sync com develop final
git pull origin develop
git push origin feature/nome
```

---

## Finalizar Feature
```bash
# Código pronto
git push origin feature/nome

# Criar PR no GitHub
# https://github.com/MullerHub/ArtistLog_Front_End/pulls
# → "New pull request"
# → Base: develop | Compare: feature/nome
# → Descrever o que foi feito
# → "Create pull request"

# Após merging
git checkout develop
git pull origin develop
git branch -d feature/nome
git push origin --delete feature/nome
```

---

## Sync com Latest Develop
```bash
git fetch origin
git rebase origin/develop
# (se conflito, resolve + git rebase --continue)
git push -f origin feature/nome
```

---

## Ver Status
```bash
git status              # ver arquivos mudados
git log --oneline       # ver commits
git branch -a           # ver todas branches
git branch --list       # branches locais
```

---

## Desfazer Coisas
```bash
# Undo last commit (não deletou)
git reset HEAD~1

# Descartar mudanças em arquivo
git checkout -- lib/api-client.ts

# Deletar branch
git branch -d feature/nome
```

---

## Mensagens de Commit
```bash
git commit -m "feat: add something new"
git commit -m "fix: correção de bug"
git commit -m "refactor: melhorar código"
git commit -m "docs: update readme"
git commit -m "test: add test case"
```

---

## Environment

**Local Development:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev
```

**Production (Vercel):**  
Sem fazer nada (auto fallback via `lib/api-client.ts`)

---

## Debugging
```bash
# Browser console (F12)
# Check Network tab for API calls

# Check env vars resolved
curl -s https://artist-log-front-end.vercel.app
# look for API calls in Network

# Test backend CORS locally
curl -s -I -X OPTIONS https://artistlog-backend-latest.onrender.com/auth/login \
  -H "Origin: http://localhost:3000"
```

---

## Key Rules
- ✅ Develop em `feature/*` branches
- ✅ PR → `develop` após pronto
- ✅ `main` apenas automated deploy (não touch)
- ✅ Commits pequenos e frequentes
- ✅ Pull `develop` antes de criar feature nova
- ❌ Não push direto em `main`
- ❌ Não commit em `develop` sem PR

---

## Docs Completos
- 📖 `.github/BRANCHING_STRATEGY.md` - guia completo
- 📖 `.github/instructions/deployment.instructions.md` - deploy
- 📖 `.github/instructions/project-overview.instructions.md` - visão geral

---

**Dúvidas?** Consulte `BRANCHING_STRATEGY.md` ou `project-overview.instructions.md`
