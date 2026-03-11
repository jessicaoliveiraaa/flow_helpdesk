# Flow Helpdesk

Sistema de helpdesk com autenticação JWT, controle de acesso por perfil e interface moderna.

## Stack

- **Backend**: Node.js, Fastify v5, Prisma v6, PostgreSQL, JWT, Zod
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router DOM v7

## Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (ou via Docker)

## Configuração

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/flow_helpdesk"
JWT_SECRET="sua-chave-secreta-aqui"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW="1 minute"
PORT=3333
```

### 3. Execute as migrations do banco de dados

```bash
npx prisma migrate deploy
```

### 4. Popule o banco com dados de exemplo

```bash
npm run prisma:seed
```

Isso cria três usuários de teste:

| E-mail                    | Senha   | Perfil        |
|---------------------------|---------|---------------|
| admin@helpdesk.com        | 123456  | Administrador |
| tecnico@helpdesk.com      | 123456  | Técnico       |
| cliente@helpdesk.com      | 123456  | Cliente       |

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3333](http://localhost:3333)

## Scripts disponíveis

| Script                  | Descrição                                  |
|-------------------------|--------------------------------------------|
| `npm run dev`           | Inicia backend + frontend simultaneamente  |
| `npm run dev:server`    | Inicia apenas o servidor backend           |
| `npm run dev:client`    | Inicia apenas o frontend                   |
| `npm run start:server`  | Inicia backend sem watch                   |
| `npm run build`         | Build de produção do frontend              |
| `npm run typecheck`     | Checa TypeScript (client + server)         |
| `npm run test`          | Executa testes automatizados               |
| `npm run validate`      | Typecheck + testes + build                 |
| `npm run prisma:seed`   | Popula o banco com dados iniciais          |

## Perfis de acesso

| Perfil       | Pode criar chamados | Ver todos os chamados | Alterar status | Comentário interno | Gerenciar usuários |
|--------------|---------------------|-----------------------|----------------|--------------------|--------------------|
| ADMIN        | ✓                   | ✓ (todos)             | ✓              | ✓                  | ✓                  |
| TECHNICIAN   | ✗                   | ✓ (atribuídos)        | ✓              | ✓                  | ✗                  |
| CLIENT       | ✓                   | ✓ (próprios)          | ✗              | ✗                  | ✗                  |

## Funcionalidades

- Login com JWT e sessão persistida no localStorage
- Dashboard com criação, listagem, filtros e exclusão de chamados
- Painel de comentários por chamado (com suporte a comentários internos)
- Página de gerenciamento de usuários (somente ADMIN)
- Interface com glassmorphism, animações e design responsivo

## Hardening aplicado

- Rate limiting no endpoint de login (`/auth/login`)
- CORS configurado por ambiente (produção usa `CORS_ORIGIN`)
- Headers de segurança HTTP com `@fastify/helmet`
- Handler global de erros com retorno padronizado para validação
- Encerramento gracioso do servidor em `SIGINT`/`SIGTERM`

## Checklist de deploy

1. Definir variáveis de ambiente de produção (`NODE_ENV=production`, `CORS_ORIGIN`, `JWT_SECRET`, `DATABASE_URL`).
2. Rodar migrations no banco de produção (`npx prisma migrate deploy`).
3. Validar aplicação localmente com `npm run validate`.
4. Buildar frontend com `npm run build`.
5. Subir backend com `npm run start:server`.
