# Cronia Backend

**Cronia** é uma plataforma de crédito colateralizado baseada em Solana, permitindo que consumidores usem tokens, NFTs e LPs como garantia para obter crédito instantâneo e realizar compras em estabelecimentos parceiros.

Este repositório contém o **backend** (API + serviços) da plataforma, **sem incluir os smart contracts on-chain** (que serão desenvolvidos separadamente).

---

## 🏗️ Arquitetura

```
cronia-backend/
├── apps/
│   ├── api/              # API REST (NestJS)
│   ├── keeper/           # Jobs agendados (billing, liquidação)
│   └── indexer/          # Listener de eventos blockchain
├── prisma/
│   ├── schema.prisma     # Schema do banco de dados
│   └── seed.ts           # Dados de teste
├── docker-compose.yml    # Infraestrutura local
└── .env.example          # Variáveis de ambiente
```

### Serviços

1. **API** (`apps/api`): Gateway REST com autenticação via wallet Solana (SIWS)
2. **Keeper** (`apps/keeper`): Scheduler de jobs automáticos (fechamento de fatura, liquidação)
3. **Indexer** (`apps/indexer`): Processa eventos da blockchain Solana

---

## 🚀 Instalação e Setup

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (ou use o container)
- Redis 7+ (ou use o container)

### 1. Clone o repositório

```bash
git clone <repo-url>
cd cronia-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 4. Inicie a infraestrutura com Docker

```bash
npm run docker:up
```

Isso irá subir:
- PostgreSQL na porta `5432`
- Redis na porta `6379`

### 5. Execute as migrações do banco

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 6. Popule o banco com dados de teste

```bash
npm run prisma:seed
```

### 7. Inicie os serviços

**Opção 1: Rodar todos os serviços localmente**

```bash
npm run dev:all
```

**Opção 2: Rodar serviços individuais**

```bash
# Terminal 1 - API
npm run api:dev

# Terminal 2 - Keeper
npm run keeper:dev

# Terminal 3 - Indexer
npm run indexer:dev
```

---

## 📡 Endpoints da API

A API estará disponível em: **http://localhost:3000/v1**

### Documentação Interativa (Swagger)

Acesse: **http://localhost:3000/docs**

### Principais Rotas


#### 🔐 Autenticação (SIWS - Sign In With Solana)

- `POST /v1/auth/challenge` - Obter mensagem para assinar
- `POST /v1/auth/verify` - Verificar assinatura e fazer login
- `POST /v1/auth/logout` - Logout

#### 👤 Consumidores

- `GET /v1/consumers/me` - Perfil do consumidor
- `PUT /v1/consumers/me` - Atualizar perfil
- `GET /v1/consumers/me/credit-accounts` - Contas de crédito
- `GET /v1/consumers/me/transactions` - Histórico de transações

#### 🏪 Lojistas (Merchants)

- `POST /v1/merchants/register` - Registrar lojista
- `GET /v1/merchants/me` - Perfil do lojista
- `POST /v1/merchants/me/regenerate-api-key` - Regenerar API key
- `GET /v1/merchants/me/receivables` - Recebíveis

#### 🛒 Checkout

- `POST /v1/checkout/sessions` - Criar sessão de checkout
- `GET /v1/checkout/sessions/:token` - Consultar sessão
- `POST /v1/checkout/sessions/:token/approve` - Aprovar compra
- `POST /v1/checkout/sessions/:token/reject` - Rejeitar compra

#### 💰 Faturamento (Billing)

- `GET /v1/billing/invoices` - Listar faturas
- `GET /v1/billing/invoices/:id` - Detalhes da fatura
- `POST /v1/billing/invoices/:id/repay` - Pagar fatura

#### 🔒 Colateral

- `POST /v1/collateral/deposit` - Depositar colateral
- `DELETE /v1/collateral/:id/withdraw` - Retirar colateral
- `GET /v1/collateral` - Listar colaterais

#### 📊 Admin

- `GET /v1/admin/stats` - Estatísticas da plataforma
- `GET /v1/admin/activity` - Atividade recente
- `GET /v1/admin/credit-accounts` - Todas as contas de crédito

---

## 🧪 Testes

### Dados de Seed

Após rodar `npm run prisma:seed`, você terá:

**Consumidor de Teste:**
- Wallet: `TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA`
- Email: `consumer@test.com`
- Conta de crédito com $1000 de limite

**Lojista de Teste:**
- Wallet: `TestMerchant8yLYug3DX98e08UYKTEqcE6kCifuUrB`
- Email: `merchant@test.com`
- API Key: `cronia_test_api_key_123456789`

### Exemplo: Login com Wallet

```bash
# 1. Obter challenge
curl -X POST http://localhost:3000/v1/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA"}'

# 2. Assinar a mensagem com a wallet (use Phantom/Solflare)
# ...

# 3. Verificar e obter token JWT
curl -X POST http://localhost:3000/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA",
    "message": "<mensagem do challenge>",
    "signature": "<assinatura base58>",
    "userType": "consumer"
  }'
```

---

## ⚙️ Serviços de Background

### Keeper (Jobs Automáticos)

O Keeper executa jobs agendados:

- **Billing Job**: Executa todo dia às 00:00 para fechar faturas mensais
- **Risk Monitor**: Executa a cada 5 minutos para calcular health factor
- **Liquidation Job**: Executa a cada hora para liquidar contas inadimplentes

### Indexer (Eventos Blockchain)

O Indexer monitora eventos on-chain e atualiza o banco de dados:

- Depósitos de colateral confirmados
- Saques de colateral
- Pagamentos de fatura
- Liquidações

**Nota:** No MVP, o indexer está configurado para processar eventos mockados. Na versão de produção, ele irá consumir logs de programa Solana via WebSocket.

---

## 🗄️ Banco de Dados

### Schema Principal

- **consumers**: Usuários consumidores
- **merchants**: Lojistas parceiros
- **credit_accounts**: Contas de crédito dos consumidores
- **collateral_deposits**: Garantias depositadas (tokens/NFTs)
- **checkout_sessions**: Sessões de checkout
- **receivables**: Recebíveis dos lojistas
- **invoices**: Faturas mensais
- **payments**: Pagamentos realizados
- **transactions**: Histórico de transações
- **blockchain_events**: Eventos da blockchain

### Comandos Prisma

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar nova migration
npm run prisma:migrate

# Abrir Prisma Studio (GUI)
npx prisma studio
```

---

## 🐳 Docker

### Desenvolvimento Local

```bash
# Subir infraestrutura (Postgres + Redis)
npm run docker:up

# Ver logs
npm run docker:logs

# Parar containers
npm run docker:down
```

### Build para Produção

```bash
# Build da API
docker build -f apps/api/Dockerfile -t cronia-api .

# Build do Keeper
docker build -f apps/keeper/Dockerfile -t cronia-keeper .

# Build do Indexer
docker build -f apps/indexer/Dockerfile -t cronia-indexer .
```

---

## 📝 Variáveis de Ambiente

Principais variáveis (veja `.env.example` para lista completa):

```env
# Database
DATABASE_URL="postgresql://cronia:cronia123@localhost:5432/cronia_db"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Risk Parameters
MIN_HEALTH_FACTOR=1.2
LIQUIDATION_THRESHOLD=1.1
LTV_RATIO=0.8

# Billing
BILLING_CYCLE_DAY=1
BILLING_GRACE_PERIOD_DAYS=15
BILLING_LIQUIDATION_DAYS=30
```

---

## 🔄 Fluxo de Uso

### 1. Consumidor Deposita Colateral

```
POST /v1/collateral/deposit
{
  "tokenMint": "So11111111111111111111111111111111111111112",
  "tokenType": "SPL",
  "amount": 100,
  "valueUsd": 10000,
  "ltv": 0.8
}
```

→ Sistema cria/atualiza `credit_account` com limite de $8000 (LTV 80%)

### 2. Lojista Cria Checkout

```
POST /v1/checkout/sessions
{
  "amount": 500,
  "currency": "BRL"
}
```

→ Sistema retorna `sessionToken` e `checkoutUrl`

### 3. Consumidor Aprova Compra

```
POST /v1/checkout/sessions/:token/approve
```

→ Sistema:
- Verifica crédito disponível
- Cria `receivable` para o lojista
- Debita do `credit_account`
- Registra `transaction`

### 4. Fechamento de Fatura (Automático - D0)

O Keeper executa o `BillingJob` todo dia 1º:
- Cria `invoice` com valor usado + juros
- Status: `pending`

### 5. Pagamento de Fatura

```
POST /v1/billing/invoices/:id/repay
{
  "amount": 505.98,
  "paymentMethod": "pix",
  "txSignature": "..."
}
```

→ Sistema:
- Cria `payment`
- Atualiza `invoice.paidAmount`
- Restaura crédito disponível se totalmente paga

### 6. Inadimplência (Automático - D+15)

Risk Monitor detecta fatura não paga há 15 dias:
- Marca invoice como `overdue`
- Pode congelar conta (`status: frozen`)

### 7. Liquidação (Automático - D+30)

Liquidation Job identifica fatura vencida há 30+ dias:
- Marca invoice como `liquidated`
- Liquida todos os `collateral_deposits`
- Atualiza conta para `status: liquidated`

---

## 🛠️ Stack Tecnológica

- **Runtime**: Node.js 20
- **Framework API**: NestJS
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Jobs**: BullMQ + node-cron
- **Blockchain**: Solana Web3.js
- **Autenticação**: JWT + SIWS (Sign In With Solana)
- **Logging**: Pino
- **Documentação**: Swagger (OpenAPI 3)
- **Container**: Docker

---

## 🚧 Próximos Passos (On-Chain)

Este repositório contém **apenas o backend off-chain**. Para integrar com Solana, você precisará:

1. **Desenvolver os programas Solana** (Anchor/Rust):
   - Credit Program (gerencia contas de crédito)
   - Collateral Program (escrow de tokens)
   - Billing Program (pagamentos on-chain)

2. **Conectar o Indexer** para ouvir eventos reais da blockchain

3. **Implementar assinatura de transações** no frontend

4. **Deploy dos programas** na devnet/mainnet-beta

---

## 📄 Licença

MIT License

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para o ecossistema Solana**
