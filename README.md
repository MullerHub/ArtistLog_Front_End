# ArtistLog Frontend

Aplicacao frontend do ArtistLog, plataforma para conexao entre artistas e contratantes.

## Stack

- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn/ui

## Requisitos

- Node.js 18+
- npm

## Setup local

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev`: inicia ambiente de desenvolvimento
- `npm run build`: gera build de producao
- `npm run preview`: sobe build local para validacao
- `npm run test`: roda testes unitarios
- `npm run test:e2e`: roda testes E2E com Playwright

## Variaveis de ambiente

1. Copie `.env.example` para `.env.local`.
2. Preencha apenas o necessario para seu ambiente.

Principais variaveis:

- `VITE_API_URL`: URL base da API.
- `VITE_LOCAL_API_URL`: fallback local quando `VITE_API_URL` estiver vazio em desenvolvimento.
- `VITE_PROD_API_FALLBACK_URL`: fallback de producao quando `VITE_API_URL` estiver vazio.
- `VITE_HOST`, `VITE_PORT`: host/porta do Vite local.

Variaveis de E2E:

- `E2E_BASE_URL`: se definido, o Playwright usa essa URL e nao sobe `webServer`.
- `E2E_HOST`, `E2E_PORT`: host/porta para subir o frontend em testes E2E.
- `E2E_API_URL`: URL opcional para mocks/helpers de API em E2E.
