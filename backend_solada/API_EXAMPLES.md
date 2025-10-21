# 📡 API Examples - Cronia

Exemplos práticos de requisições para a API Cronia.

---

## 🔐 Autenticação (SIWS - Sign In With Solana)

### 1. Obter Challenge

```bash
curl -X POST http://localhost:3000/v1/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA"
  }'
```

**Response:**
```json
{
  "message": "localhost wants you to sign in with your Solana account:\nTestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA\n\nSign in to Cronia\n\nURI: http://localhost:3000\n...",
  "walletAddress": "TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA"
}
```

### 2. Verificar Assinatura e Login

```bash
curl -X POST http://localhost:3000/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA",
    "message": "<message from challenge>",
    "signature": "<base58 signature>",
    "userType": "consumer"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "walletAddress": "TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA",
    "type": "consumer"
  }
}
```

---

## 👤 Consumidores

### Obter Perfil

```bash
curl http://localhost:3000/v1/consumers/me \
  -H "Authorization: Bearer <token>"
```

### Atualizar Perfil

```bash
curl -X PUT http://localhost:3000/v1/consumers/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "phone": "+55 11 98765-4321",
    "fullName": "João Silva"
  }'
```

### Listar Contas de Crédito

```bash
curl http://localhost:3000/v1/consumers/me/credit-accounts \
  -H "Authorization: Bearer <token>"
```

### Histórico de Transações

```bash
curl "http://localhost:3000/v1/consumers/me/transactions?limit=20" \
  -H "Authorization: Bearer <token>"
```

---

## 🏪 Lojistas (Merchants)

### Registrar Novo Lojista

```bash
curl -X POST http://localhost:3000/v1/merchants/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "NewMerchant9zNYvh5GX09f19VZMUGqeE7kDjxWvF",
    "businessName": "Minha Loja Ltda",
    "email": "loja@example.com",
    "cnpj": "12.345.678/0001-90",
    "phone": "+55 11 91234-5678",
    "webhookUrl": "https://mystore.com/webhook/cronia"
  }'
```

### Obter Perfil do Lojista

```bash
curl http://localhost:3000/v1/merchants/me \
  -H "Authorization: Bearer <token>"
```

### Regenerar API Key

```bash
curl -X POST http://localhost:3000/v1/merchants/me/regenerate-api-key \
  -H "Authorization: Bearer <token>"
```

### Listar Recebíveis

```bash
curl "http://localhost:3000/v1/merchants/me/receivables?status=settled" \
  -H "Authorization: Bearer <token>"
```

---

## 🛒 Checkout

### Criar Sessão de Checkout (Lojista)

```bash
curl -X POST http://localhost:3000/v1/checkout/sessions \
  -H "Authorization: Bearer <merchant-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 250.00,
    "currency": "BRL",
    "metadata": {
      "orderId": "ORDER-123",
      "items": [
        {"name": "Product A", "quantity": 2, "price": 125.00}
      ]
    }
  }'
```

**Response:**
```json
{
  "sessionId": "uuid",
  "sessionToken": "cs_1234567890abcdef",
  "amount": 250.00,
  "currency": "BRL",
  "expiresAt": "2025-01-20T14:30:00Z",
  "checkoutUrl": "http://localhost:3001/checkout/cs_1234567890abcdef"
}
```

### Consultar Sessão de Checkout

```bash
curl http://localhost:3000/v1/checkout/sessions/cs_1234567890abcdef
```

### Aprovar Compra (Consumidor)

```bash
curl -X POST http://localhost:3000/v1/checkout/sessions/cs_1234567890abcdef/approve \
  -H "Authorization: Bearer <consumer-token>"
```

### Rejeitar Compra (Consumidor)

```bash
curl -X POST http://localhost:3000/v1/checkout/sessions/cs_1234567890abcdef/reject \
  -H "Authorization: Bearer <consumer-token>"
```

---

## 💰 Faturamento (Billing)

### Listar Faturas

```bash
curl "http://localhost:3000/v1/billing/invoices?creditAccountId=<account-id>" \
  -H "Authorization: Bearer <token>"
```

### Detalhes da Fatura

```bash
curl http://localhost:3000/v1/billing/invoices/<invoice-id> \
  -H "Authorization: Bearer <token>"
```

### Pagar Fatura

```bash
curl -X POST http://localhost:3000/v1/billing/invoices/<invoice-id>/repay \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 205.98,
    "paymentMethod": "pix",
    "txSignature": "5xJ8ug3DW87e97UXJTEqcE5kChfvVrC..."
  }'
```

---

## 🔒 Colateral

### Depositar Colateral

```bash
curl -X POST http://localhost:3000/v1/collateral/deposit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenMint": "So11111111111111111111111111111111111111112",
    "tokenType": "SPL",
    "amount": 10,
    "valueUsd": 1000,
    "ltv": 0.8
  }'
```

**Response:**
```json
{
  "deposit": {
    "id": "uuid",
    "tokenMint": "So11111111111111111111111111111111111111112",
    "amount": "10",
    "valueUsd": "1000",
    "status": "active"
  },
  "creditAccount": {
    "id": "uuid",
    "creditLimit": "800",
    "availableCredit": "800",
    "healthFactor": "2.0"
  }
}
```

### Listar Colaterais

```bash
curl "http://localhost:3000/v1/collateral?creditAccountId=<account-id>" \
  -H "Authorization: Bearer <token>"
```

### Retirar Colateral

```bash
curl -X DELETE http://localhost:3000/v1/collateral/<deposit-id>/withdraw \
  -H "Authorization: Bearer <token>"
```

---

## 📊 Admin

### Estatísticas da Plataforma

```bash
curl http://localhost:3000/v1/admin/stats \
  -H "Authorization: Bearer <admin-token>"
```

**Response:**
```json
{
  "totalConsumers": 150,
  "totalMerchants": 45,
  "totalCreditAccounts": 120,
  "totalCollateralUsd": 500000,
  "totalReceivables": 75000,
  "pendingInvoices": 25
}
```

### Atividade Recente

```bash
curl "http://localhost:3000/v1/admin/activity?limit=50" \
  -H "Authorization: Bearer <admin-token>"
```

### Listar Contas de Crédito

```bash
curl "http://localhost:3000/v1/admin/credit-accounts?status=active" \
  -H "Authorization: Bearer <admin-token>"
```

---

## 🏥 Health Check

```bash
curl http://localhost:3000/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": "connected"
}
```

---

## 📦 Recebíveis (Receivables)

### Listar Recebíveis do Lojista

```bash
curl "http://localhost:3000/v1/receivables?status=settled" \
  -H "Authorization: Bearer <merchant-token>"
```

### Detalhes do Recebível

```bash
curl http://localhost:3000/v1/receivables/<receivable-id> \
  -H "Authorization: Bearer <merchant-token>"
```

---

## 🔄 Fluxo Completo - Exemplo

### 1. Lojista cria checkout

```bash
# Login do lojista
MERCHANT_TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/verify ...)

# Criar sessão
SESSION=$(curl -s -X POST http://localhost:3000/v1/checkout/sessions \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150.00, "currency": "BRL"}')

SESSION_TOKEN=$(echo $SESSION | jq -r '.sessionToken')
```

### 2. Consumidor aprova

```bash
# Login do consumidor
CONSUMER_TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/verify ...)

# Aprovar compra
curl -X POST http://localhost:3000/v1/checkout/sessions/$SESSION_TOKEN/approve \
  -H "Authorization: Bearer $CONSUMER_TOKEN"
```

### 3. Consumidor paga fatura

```bash
# Listar faturas pendentes
INVOICES=$(curl -s "http://localhost:3000/v1/billing/invoices?creditAccountId=..." \
  -H "Authorization: Bearer $CONSUMER_TOKEN")

INVOICE_ID=$(echo $INVOICES | jq -r '.[0].id')

# Pagar
curl -X POST http://localhost:3000/v1/billing/invoices/$INVOICE_ID/repay \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 154.49,
    "paymentMethod": "pix"
  }'
```

---

## 🛠️ Ferramentas Úteis

### HTTPie (alternativa ao cURL)

```bash
# Instalar
brew install httpie  # macOS
apt install httpie   # Linux

# Exemplo
http POST localhost:3000/v1/auth/challenge walletAddress="Test..."
```

### Postman / Insomnia

Importe a coleção a partir do Swagger:
```
http://localhost:3000/docs-json
```

---

**Para mais detalhes, consulte a [documentação Swagger](http://localhost:3000/docs)**
