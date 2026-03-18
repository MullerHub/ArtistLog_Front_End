# TODO de cobertura de testes

Ponto de parada em 16/03/2026.

Status atual:
- Suite unitária passando com 108 de 108 testes.
- Coverage configurado com Vitest + V8.
- Cobertura total ainda está abaixo da meta de 100%.

Já coberto nesta etapa:
- services: contracts-service com suíte expandida
- hooks: use-toast, use-mobile
- contexts: AuthContext, NotificationContext, ThemeContext
- components: CitySearch

Próximos passos recomendados:
1. Completar cobertura de services restantes: auth-service, notifications-service, artists-service, venues-service, schedules-service, api-client.
2. Cobrir componentes críticos compartilhados: AppSidebar, NotificationCenter e componentes reutilizados com lógica própria.
3. Cobrir páginas prioritárias: LandingPage, ContractDetailPage, SettingsPage, RegisterPage, ArtistsPage.
4. Cobrir páginas restantes e utilitários ainda descobertos por `coverage`.
5. Decidir se a meta de 100% literal vai incluir `src/components/ui`, `src/data` e `src/types`; se sim, adicionar testes específicos ou revisar a estratégia de exclusão.

Observações úteis:
- Preferir mocks importados diretamente com `vi.mock(...)` em vez de `require(...)` para módulos com alias `@/`.
- Evitar fake timers quando houver debounce + `waitFor`, exceto quando o teste realmente controlar todos os avanços de tempo.
- Para Playwright, continuar priorizando locators por role para evitar ambiguidade em strict mode.