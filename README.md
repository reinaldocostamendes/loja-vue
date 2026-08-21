# Loja Vue — Frontend + Backoffice

App em **Vue 3 + Vite** que consome a `loja-api-prod` (PHP puro): loja online (catálogo, carrinho, checkout) e backoffice de administração, no mesmo projeto, com pagamentos por **Cartão, MB WAY e Multibanco** via Stripe.

## Stack

- Vue 3 (`<script setup>`) + Vite
- Vue Router 4 (rotas da loja em `/`, backoffice em `/admin`, protegidas por autenticação/papel)
- Pinia (sessão, carrinho, notificações)
- Tailwind CSS v4
- Axios
- `@stripe/stripe-js` (Stripe Elements para o pagamento por cartão)
- `qrcode.vue` (QR code para ativação do 2FA)

## Pré-requisitos

- Node.js 18+
- A API `loja-api-prod` a correr (ver o README dessa pasta) — precisa de MySQL/MariaDB e, para os pagamentos funcionarem, de chaves Stripe de teste configuradas no `.env` da API.

## Configuração

1. Instalar dependências:

   ```bash
   npm install
   ```

2. Copiar `.env.example` para `.env` e apontar para a tua API:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_API_URL=http://localhost:8080/api
   ```

3. Correr em desenvolvimento:

   ```bash
   npm run dev
   ```

   Abre em `http://localhost:5173`.

4. Build de produção:

   ```bash
   npm run build
   npm run preview   # para testar o build localmente
   ```

   Os ficheiros gerados ficam em `dist/` — basta servir essa pasta como um site estático (Nginx, Apache, Vercel, Netlify, etc.). Como é uma SPA com `vue-router` em modo `history`, o servidor tem de reencaminhar todas as rotas desconhecidas para `index.html` (equivalente ao `try_files` do exemplo Nginx no README da API).

## Deploy no Vercel

O projeto já inclui um `vercel.json` com o preset Vite e o *rewrite* necessário para o `vue-router` (todas as rotas caem em `index.html`, para que `/produtos/3` ou `/admin/produtos` funcionem em acesso direto/refresh, não só navegando dentro da app).

1. Importa o repositório no Vercel (ou faz `vercel` a partir desta pasta com a Vercel CLI). O Vercel deteta automaticamente o framework Vite — build command `npm run build`, output directory `dist`.
2. Em **Project Settings → Environment Variables**, cria `VITE_API_URL` com o URL público da tua API (ex: `https://api.a-tua-loja.com/api`). Como é uma variável `VITE_*`, fica embutida no bundle **no momento do build** — se a alterares depois, precisas de fazer redeploy para ter efeito.
3. Faz deploy.

⚠️ **Importante:** o Vercel só aloja este frontend (ficheiros estáticos). A `loja-api-prod` é PHP puro com ligação direta a MySQL/MariaDB via PDO — isso não corre no Vercel (que é pensado para funções serverless Node/Edge, não para long-running PHP+MySQL). Precisas de alojar a API à parte, nalgum sítio que corra PHP 8+ com MySQL (uma VPS, hosting PHP tradicional, Railway, etc.), e apontar o `VITE_API_URL` do passo 2 para esse endereço.

Depois de teres a API num domínio público, adiciona o domínio do teu deploy Vercel (ex: `https://a-tua-loja.vercel.app`) a `CORS_ALLOWED_ORIGINS` no `.env` da API — caso contrário o browser bloqueia os pedidos por CORS.

## Estrutura

```
src/
├── api/          # Um ficheiro por recurso da API (auth, catalog, cart, orders, payments, admin)
├── stores/        # Pinia: auth (sessão/JWT), cart (carrinho), toast (notificações)
├── router/        # Rotas + guards (auth, role admin, guest-only)
├── layouts/        # StoreLayout (loja) e AdminLayout (backoffice, com sidebar)
├── components/
│   ├── ui/          # Componentes genéricos (botão, input, modal, badge de estado, paginação...)
│   ├── layout/       # Cabeçalho/rodapé da loja, sidebar do backoffice
│   ├── store/         # ProductCard, ProductImage, e components/store/payments/ (Cartão, MB WAY, Multibanco)
│   └── admin/          # PageHeader, StatCard, modais de formulário (produto, categoria, utilizador)
└── views/
    ├── store/           # Home, Produto, Carrinho, Checkout, Encomendas, Conta, Login/Registo
    └── admin/            # Dashboard, Produtos, Categorias, Encomendas, Utilizadores
```

## Autenticação e sessão

- O JWT devolvido pela API é guardado em `localStorage` (`loja_token`), com os dados do utilizador em `loja_user`.
- Todos os pedidos autenticados enviam automaticamente `Authorization: Bearer <token>` (ver `src/api/http.js`).
- Um `401` da API limpa a sessão localmente. As rotas com `meta.requiresAuth` redirecionam para `/entrar` (guardando `?redirect=` para voltar depois do login).
- Rotas de backoffice (`/admin/*`) exigem `meta.requiresAdmin`; utilizadores não-admin são redirecionados para a loja.
- O fluxo de 2FA (login em duas etapas) e a ativação/desativação de 2FA (com QR code) estão implementados em `LoginView.vue` e `AccountView.vue`.

## Pagamentos

O fluxo é: criar encomenda (`/checkout`) → página da encomenda (`/encomendas/:id`) → escolher método de pagamento:

- **Cartão** (`components/store/payments/CardPayment.vue`): a API cria o `PaymentIntent` e devolve `client_secret` + `publishable_key`; o frontend usa Stripe Elements para recolher os dados do cartão e confirmar diretamente com o Stripe — os dados do cartão nunca passam pelo backend desta app.
- **MB WAY** (`MbWayPayment.vue`): pede o número de telemóvel, inicia o pagamento e faz *polling* ao estado a cada poucos segundos até aprovação na app.
- **Multibanco** (`MultibancoPayment.vue`): pede nome/email, mostra entidade + referência + montante, e faz *polling* automático (e permite verificar manualmente) até o pagamento ser confirmado.

Números de teste do Stripe (modo de teste): cartão `4242 4242 4242 4242` (validade futura, CVC à escolha); para simular recusa, `4000 0000 0000 0002`. MB WAY e Multibanco são simulados automaticamente/manualmente pelo Stripe em modo de teste — ver o README da API para detalhes.

⚠️ Isto exige que a API tenha `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` configuradas no seu `.env` — sem isso, os endpoints de pagamento devolvem erro 502.

## Conta de administrador inicial

Criada pelo `schema.sql` da API:

- **Email:** `admin@loja.test`
- **Palavra-passe:** `Admin123!`

Entra com esta conta e vais automaticamente ver o link "Backoffice" no menu (ou acede diretamente a `/admin`).

## Notas

- Não há endpoint na API para o próprio utilizador editar o seu nome/email/password (só o admin pode editar outros utilizadores via `/admin/users`). Por isso a página "A minha conta" foca-se no essencial: dados do perfil e gestão do 2FA.
- As imagens dos produtos são um simples URL (campo `image` da API) — não há upload de ficheiros nesta versão; cola o link de uma imagem ao criar/editar um produto no backoffice.
