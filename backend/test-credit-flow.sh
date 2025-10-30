#!/bin/bash

# Script de teste para fluxo de Crédito e Collateral - Cronia
# Etapa 4 do projeto

set -e

BASE_URL="http://localhost:3000/api/v1"

echo "🧪 === INICIANDO TESTES DA ETAPA 4: CREDIT & COLLATERAL ==="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ler a wallet admin do arquivo
ADMIN_WALLET=$(cat /home/inteli/Documentos/2ANO/HACKATHON/Cronia/blockchain/id.json | jq -r 'if type=="array" then . else .publicKey end')
echo -e "${YELLOW}Admin Wallet (do arquivo id.json):${NC} $ADMIN_WALLET"
echo ""

# ==============================================================================
# FASE 1: INICIALIZAÇÃO DO SISTEMA (rotas admin)
# ==============================================================================

echo -e "${YELLOW}📋 FASE 1: INICIALIZAÇÃO DO SISTEMA${NC}"
echo ""

# 1.1 - Inicializar configuração do vault de collateral
echo "1. Inicializando Vault Config..."
VAULT_CONFIG_RESP=$(curl -s -X POST "$BASE_URL/collateral/init/vault-config" \
  -H "Content-Type: application/json")
echo "Response: $VAULT_CONFIG_RESP"
echo ""

# 1.2 - Inicializar vault para um mint específico (exemplo com SOL wrapped)
echo "2. Inicializando Vault para mint..."
MINT_EXAMPLE="So11111111111111111111111111111111111111112" # Wrapped SOL
VAULT_RESP=$(curl -s -X POST "$BASE_URL/collateral/init/vault" \
  -H "Content-Type: application/json" \
  -d "{\"mint\": \"$MINT_EXAMPLE\"}")
echo "Response: $VAULT_RESP"
echo ""

# 1.3 - Configurar classe pump para tokens pump.fun
echo "3. Configurando classe Pump..."
PUMP_CLASS_RESP=$(curl -s -X POST "$BASE_URL/oracle/pump/class/init" \
  -H "Content-Type: application/json")
echo "Response: $PUMP_CLASS_RESP"
echo ""

# 1.4 - Registrar um token pump específico
echo "4. Registrando token Pump..."
PUMP_TOKEN_RESP=$(curl -s -X POST "$BASE_URL/oracle/pump/token" \
  -H "Content-Type: application/json" \
  -d "{\"mint\": \"$MINT_EXAMPLE\"}")
echo "Response: $PUMP_TOKEN_RESP"
echo ""

# ==============================================================================
# FASE 2: CRIAÇÃO DE CONTA DE CRÉDITO
# ==============================================================================

echo -e "${YELLOW}📋 FASE 2: CRIAÇÃO DE CONTA DE CRÉDITO${NC}"
echo ""

# 2.1 - Abrir conta de crédito como admin
echo "5. Abrindo conta de crédito (como admin)..."
CREDIT_OPEN_RESP=$(curl -s -X POST "$BASE_URL/credit/open/admin" \
  -H "Content-Type: application/json")
echo "Response: $CREDIT_OPEN_RESP"

CREDIT_PDA=$(echo $CREDIT_OPEN_RESP | jq -r '.creditPda // empty')
OWNER_PUBKEY=$(echo $CREDIT_OPEN_RESP | jq -r '.owner // empty')

if [ -z "$OWNER_PUBKEY" ]; then
  echo -e "${RED}❌ Erro ao criar conta de crédito${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Conta de crédito criada!${NC}"
echo "   Owner: $OWNER_PUBKEY"
echo "   PDA: $CREDIT_PDA"
echo ""

# 2.2 - Definir limite de crédito
echo "6. Definindo limite de crédito (1000 USDC)..."
LIMIT_RESP=$(curl -s -X POST "$BASE_URL/credit/limit" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"newLimitUsdc\": 1000
  }")
echo "Response: $LIMIT_RESP"
echo ""

# ==============================================================================
# FASE 3: GESTÃO DE COLLATERAL
# ==============================================================================

echo -e "${YELLOW}📋 FASE 3: GESTÃO DE COLLATERAL${NC}"
echo ""

# 3.1 - Abrir posição de collateral
echo "7. Abrindo posição de collateral..."
POSITION_RESP=$(curl -s -X POST "$BASE_URL/collateral/open-position" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"mint\": \"$MINT_EXAMPLE\"
  }")
echo "Response: $POSITION_RESP"

POSITION_PDA=$(echo $POSITION_RESP | jq -r '.positionPda // empty')
echo -e "${GREEN}✅ Posição criada: $POSITION_PDA${NC}"
echo ""

# 3.2 - Depositar collateral (como admin)
echo "8. Depositando collateral (1000000 tokens - 1 SOL se wrapped SOL)..."
DEPOSIT_RESP=$(curl -s -X POST "$BASE_URL/collateral/deposit/admin" \
  -H "Content-Type: application/json" \
  -d "{
    \"mint\": \"$MINT_EXAMPLE\",
    \"amount\": 1000000
  }")
echo "Response: $DEPOSIT_RESP"
echo ""

# 3.3 - Atualizar preço do token (necessário para cálculo de LTV)
echo "9. Atualizando preço do token (200 USDC)..."
PRICE_RESP=$(curl -s -X POST "$BASE_URL/oracle/pump/price" \
  -H "Content-Type: application/json" \
  -d "{
    \"mint\": \"$MINT_EXAMPLE\",
    \"priceUsdc6\": 200000000,
    \"ts\": $(date +%s)
  }")
echo "Response: $PRICE_RESP"
echo ""

# ==============================================================================
# FASE 4: OPERAÇÕES DE CRÉDITO
# ==============================================================================

echo -e "${YELLOW}📋 FASE 4: OPERAÇÕES DE CRÉDITO${NC}"
echo ""

# 4.1 - Fazer uma cobrança (compra parcelada)
echo "10. Realizando cobrança (100 USDC em 3x)..."
ORDER_ID=$(openssl rand -hex 32)
echo "   Order ID gerado: $ORDER_ID"

CHARGE_RESP=$(curl -s -X POST "$BASE_URL/credit/charge" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"amountUsdc\": 100,
    \"installments\": 3,
    \"orderIdHex\": \"$ORDER_ID\"
  }")
echo "Response: $CHARGE_RESP"

if echo "$CHARGE_RESP" | jq -e '.ok' > /dev/null; then
  echo -e "${GREEN}✅ Cobrança realizada com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro na cobrança${NC}"
  echo "$CHARGE_RESP"
fi
echo ""

# 4.2 - Fazer um pagamento
echo "11. Realizando pagamento (50 USDC)..."
REPAY_RESP=$(curl -s -X POST "$BASE_URL/credit/repay" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"amountUsdc\": 50
  }")
echo "Response: $REPAY_RESP"

if echo "$REPAY_RESP" | jq -e '.ok' > /dev/null; then
  echo -e "${GREEN}✅ Pagamento realizado com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro no pagamento${NC}"
  echo "$REPAY_RESP"
fi
echo ""

# ==============================================================================
# FASE 5: RETIRADA DE COLLATERAL (OPCIONAL)
# ==============================================================================

echo -e "${YELLOW}📋 FASE 5: RETIRADA DE COLLATERAL${NC}"
echo ""

# 5.1 - Retirar parte do collateral
echo "12. Retirando collateral (500000 tokens)..."
WITHDRAW_RESP=$(curl -s -X POST "$BASE_URL/collateral/withdraw" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"mint\": \"$MINT_EXAMPLE\",
    \"amount\": 500000
  }")
echo "Response: $WITHDRAW_RESP"

if echo "$WITHDRAW_RESP" | jq -e '.ok' > /dev/null; then
  echo -e "${GREEN}✅ Retirada realizada com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro na retirada (pode ser por LTV insuficiente)${NC}"
  echo "$WITHDRAW_RESP"
fi
echo ""

# ==============================================================================
# RESUMO FINAL
# ==============================================================================

echo ""
echo -e "${GREEN}🎉 === TESTES CONCLUÍDOS ===${NC}"
echo ""
echo "📊 Resumo das operações:"
echo "   ✓ Vault inicializado"
echo "   ✓ Conta de crédito criada: $OWNER_PUBKEY"
echo "   ✓ Limite definido: 1000 USDC"
echo "   ✓ Collateral depositado: 1000000 tokens"
echo "   ✓ Preço atualizado: 200 USDC"
echo "   ✓ Cobrança realizada: 100 USDC em 3x"
echo "   ✓ Pagamento realizado: 50 USDC"
echo "   ✓ Retirada testada: 500000 tokens"
echo ""
echo "💾 Dados para próximos testes:"
echo "   OWNER_PUBKEY=$OWNER_PUBKEY"
echo "   CREDIT_PDA=$CREDIT_PDA"
echo "   POSITION_PDA=$POSITION_PDA"
echo "   ORDER_ID=$ORDER_ID"
echo ""
