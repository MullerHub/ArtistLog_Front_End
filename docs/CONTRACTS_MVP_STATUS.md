# 🚀 MVP v1.0 - Status de Contratos

## Status: OCULTO (Semi-Pronto)

### O que foi feito:
- ✅ Backend: 100% pronto – todos os endpoints funcionam
- ✅ Frontend: Implementado – página com tabs completa
- ✅ Types & Services: TypeScript completo
- ⚠️ E2E Tests: Requer dados no backend
- ⚠️ UX: Será refinada em v1.1+

### Por que foi ocultado no MVP?

Para o lançamento da primeira versão, decidimos focar em:
1. **Discovery** (buscar artistas/venues)
2. **Profiles** (gerenciar perfil)
3. **Reviews** (avaliações)
4. **Notifications** (notificações)
5. **Community Venues** (criar/claim venues)

**Contratos** é uma feature secundária que será melhorada e habilitada na **v1.1+**.

### Onde está oculto?

1. **Navegação** - Comentado em:
   - `components/app-sidebar.tsx`
   - `components/mobile-nav.tsx`

2. **Aviso na página** - `app/(protected)/contracts/page.tsx`
   - Exibe alerta de desenvolvimento
   - Mostra que backend funciona

3. **Documentação** - Registrado em:
   - `.github/instructions/contracts.instructions.md`
   - `.github/instructions/project-overview.instructions.md`

### Como reabilitar em v1.1?

1. Descomente o item em `app-sidebar.tsx` e `mobile-nav.tsx`
2. Remova o aviso de "Em Desenvolvimento" em `contracts/page.tsx`
3. Popule o backend com dados de teste
4. Execute E2E suite completa
5. Teste em mobile e desktop
6. Integre com notification center

### URLs ainda acessíveis (para dev/admin)

- `/contracts` - Página com aviso
- `/contracts/[id]` - Detalhes (com tab interface)

Se acessadas manualmente, mostram interface com aviso bem visível.

---

**Data**: 2026-03-04  
**Próxima Revisão**: MVP v1.1 Planning
