# Aplicação CRM B2B

Uma aplicação completa de Gerenciamento de Relacionamento com o Cliente (CRM) projetada para interações Business-to-Business (B2B). Esta aplicação ajuda a gerenciar empresas, contatos e interações de forma eficiente.

## Funcionalidades

- Gerenciamento de Empresas
- Rastreamento de Interações
- Autenticação de Usuários

## Tecnologias Utilizadas

- **Framework:** Next.js
- **Linguagem:** TypeScript
- **Estilização:** ShadcnUI + Tailwind CSS
- **ORM de Banco de Dados:** Drizzle ORM
- **Autenticação:** Better-Auth
- **Gerenciador de Pacotes:** pnpm

## Como Começar

Siga estes passos para configurar e executar o projeto localmente.

### Pré-requisitos

Certifique-se de ter o seguinte instalado:

- Node.js (versão LTS recomendada)
- pnpm

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone git@github.com:Ryannnkl/mini-crm.git
    cd crm
    ```
2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione as variáveis de ambiente necessárias. Pode ser necessário consultar o código da aplicação ou perguntar ao mantenedor do projeto quais são as variáveis obrigatórias (ex: strings de conexão com o banco de dados, segredos de autenticação).

Exemplo (as variáveis podem mudar):

```
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="seu_segredo_nextauth"
NEXTAUTH_URL="http://localhost:3000"
```

### Configuração do Banco de Dados

Este projeto usa Drizzle ORM. Você precisará executar as migrações para configurar o schema do seu banco de dados.

1.  **Execute as migrações do Drizzle:**
    ```bash
    pnpm drizzle-kit migrate
    ```

### Executando o Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Screenshots

| Login                            | Dashboard                            | Detalhes da Empresa                            |
| -------------------------------- | ------------------------------------ | ---------------------------------------------- |
| ![Login](screenshots/image1.png) | ![Dashboard](screenshots/image2.png) | ![Detalhes da Empresa](screenshots/image3.png) |

## Saiba Mais

- [Documentação do Next.js](https://nextjs.org/)
- [Documentação do Drizzle ORM](https://orm.drizzle.team/)
- [Documentação do Better-Auth](https://www.better-auth.com/)
- [Documentação do ShadcnUI](https://ui.shadcn.com/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/)
