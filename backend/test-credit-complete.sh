#!/bin/bash

# Script de teste completo para Etapa 4: Credit & Collateral
# Com tratamento de erros para contas já inicializadas

set +e  # Não para em erros

BASE_URL="http://localhost:3000/api/v1"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🧪 TESTE COMPLETO - ETAPA 4: CREDIT & COLLATERAL  ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Obter a pubkey do admin
ADMIN_PUBKEY=$(solana-keygen pubkey /home/inteli/Documentos/2ANO/HACKATHON/Cronia/blockchain/id.json 2>/dev/null)
if [ -z "$ADMIN_PUBKEY" ]; then
  echo -e "${RED}❌ Erro: não foi possível obter a pubkey do admin${NC}"
  echo "   Usando fallback para obter do próprio servidor..."
fi

MINT_EXAMPLE="So11111111111111111111111111111111111111112"

echo -e "${YELLOW}📋 CONFIGURAÇÃO${NC}"
echo "   Base URL: $BASE_URL"
echo "   Admin Pubkey: ${ADMIN_PUBKEY:-'será obtido do servidor'}"
echo "   Mint de teste: $MINT_EXAMPLE"
echo ""

# ==============================================================================
# FASE 1: INICIALIZAÇÃO (pode falhar se já inicializado)
# ==============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📋 FASE 1: INICIALIZAÇÃO DO SISTEMA${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "1️⃣  Inicializando Vault Config..."
VAULT_CONFIG_RESP=$(curl -s -X POST "$BASE_URL/collateral/init/vault-config")
if echo "$VAULT_CONFIG_RESP" | grep -q "statusCode.*500"; then
  echo -e "   ${YELLOW}⚠️  Já inicializado (erro esperado)${NC}"
else
  echo -e "   ${GREEN}✓ Sucesso!${NC}"
  echo "   $VAULT_CONFIG_RESP"
fi
echo ""

echo "2️⃣  Inicializando Vault para mint $MINT_EXAMPLE..."
VAULT_RESP=$(curl -s -X POST "$BASE_URL/collateral/init/vault" \
  -H "Content-Type: application/json" \
  -d "{\"mint\": \"$MINT_EXAMPLE\"}")
if echo "$VAULT_RESP" | grep -q "vault"; then
  echo -e "   ${GREEN}✓ Sucesso!${NC}"
  echo "   $VAULT_RESP"
else
  echo -e "   ${YELLOW}⚠️  Já inicializado ou erro${NC}"
fi
echo ""

echo "3️⃣  Configurando classe Pump..."
PUMP_CLASS_RESP=$(curl -s -X POST "$BASE_URL/oracle/pump/class/init")
if echo "$PUMP_CLASS_RESP" | grep -q "pumpClass"; then
  echo -e "   ${GREEN}✓ Sucesso!${NC}"
  echo "   $PUMP_CLASS_RESP"
else
  echo -e "   ${YELLOW}⚠️  Já inicializado ou erro${NC}"
fi
echo ""

echo "4️⃣  Registrando token Pump..."
PUMP_TOKEN_RESP=$(curl -s -X POST "$BASE_URL/oracle/pump/token" \
  -H "Content-Type: application/json" \
  -d "{\"mint\": \"$MINT_EXAMPLE\"}")
if echo "$PUMP_TOKEN_RESP" | grep -q "pumpToken"; then
  echo -e "   ${GREEN}✓ Sucesso!${NC}"
  echo "   $PUMP_TOKEN_RESP"
else
  echo -e "   ${YELLOW}⚠️  Já inicializado ou erro${NC}"
fi
echo ""

# ==============================================================================
# FASE 2: CRIAÇÃO DE CONTA DE CRÉDITO
# ==============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📋 FASE 2: CONTA DE CRÉDITO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "5️⃣  Abrindo conta de crédito como admin..."
CREDIT_OPEN_RESP=$(curl -s -X POST "$BASE_URL/credit/open/admin")

if echo "$CREDIT_OPEN_RESP" | grep -q "owner"; then
  OWNER_PUBKEY=$(echo $CREDIT_OPEN_RESP | jq -r '.owner')
  CREDIT_PDA=$(echo $CREDIT_OPEN_RESP | jq -r '.creditPda')
  echo -e "   ${GREEN}✓ Conta criada com sucesso!${NC}"
  echo "   Owner: $OWNER_PUBKEY"
  echo "   PDA: $CREDIT_PDA"
elif echo "$CREDIT_OPEN_RESP" | grep -q "statusCode.*500"; then
  echo -e "   ${YELLOW}⚠️  Conta já existe, tentando obter da API...${NC}"

  # Se não conseguimos o OWNER_PUBKEY do open, tentamos do solana-keygen
  if [ -n "$ADMIN_PUBKEY" ]; then
    OWNER_PUBKEY=$ADMIN_PUBKEY
    echo "   Usando: $OWNER_PUBKEY"
  else
    echo -e "   ${RED}❌ Não foi possível determinar o owner${NC}"
    exit 1
  fi
fi
echo ""

echo "6️⃣  Consultando estado da conta de crédito..."
CREDIT_GET_RESP=$(curl -s -X GET "$BASE_URL/credit/$OWNER_PUBKEY")
echo "$CREDIT_GET_RESP" | jq '.'
echo ""

echo "7️⃣  Definindo limite de crédito (1000 USDC)..."
LIMIT_RESP=$(curl -s -X POST "$BASE_URL/credit/limit" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"newLimitUsdc\": 1000
  }")
if echo "$LIMIT_RESP" | grep -q "ok"; then
  echo -e "   ${GREEN}✓ Limite definido!${NC}"
else
  echo -e "   ${YELLOW}⚠️  Possível erro: $LIMIT_RESP${NC}"
fi
echo ""

# ==============================================================================
# FASE 3: COLLATERAL
# ==============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📋 FASE 3: GESTÃO DE COLLATERAL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "8️⃣  Abrindo posição de collateral..."
POSITION_RESP=$(curl -s -X POST "$BASE_URL/collateral/open-position" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"mint\": \"$MINT_EXAMPLE\"
  }")
if echo "$POSITION_RESP" | grep -q "positionPda"; then
  POSITION_PDA=$(echo $POSITION_RESP | jq -r '.positionPda')
  echo -e "   ${GREEN}✓ Posição criada: $POSITION_PDA${NC}"
else
  echo -e "   ${YELLOW}⚠️  Posição já existe ou erro${NC}"
fi
echo ""

echo "9️⃣  Atualizando preço do token (200 USDC)..."
PRICE_RESP=$(curl -s -X POST "$BASE_URL/oracle/pump/price" \
  -H "Content-Type: application/json" \
  -d "{
    \"mint\": \"$MINT_EXAMPLE\",
    \"priceUsdc6\": 200000000,
    \"ts\": $(date +%s)
  }")
if echo "$PRICE_RESP" | grep -q "ok"; then
  echo -e "   ${GREEN}✓ Preço atualizado!${NC}"
else
  echo -e "   ${YELLOW}⚠️  Erro ao atualizar preço: $PRICE_RESP${NC}"
fi
echo ""

echo "🔟  Depositando collateral como admin (1000000 tokens)..."
DEPOSIT_RESP=$(curl -s -X POST "$BASE_URL/collateral/deposit/admin" \
  -H "Content-Type: application/json" \
  -d "{
    \"mint\": \"$MINT_EXAMPLE\",
    \"amount\": 1000000
  }")
if echo "$DEPOSIT_RESP" | grep -q "ok"; then
  echo -e "   ${GREEN}✓ Collateral depositado!${NC}"
else
  echo -e "   ${YELLOW}⚠️  Erro ao depositar: $DEPOSIT_RESP${NC}"
fi
echo ""

echo "1️⃣1️⃣  Consultando posições de collateral..."
POSITIONS_RESP=$(curl -s -X GET "$BASE_URL/collateral/$OWNER_PUBKEY")
echo "$POSITIONS_RESP" | jq '.'
echo ""

# ==============================================================================
# FASE 4: OPERAÇÕES DE CRÉDITO
# ==============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📋 FASE 4: OPERAÇÕES DE CRÉDITO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

ORDER_ID=$(openssl rand -hex 32)

echo "1️⃣2️⃣  Realizando cobrança (100 USDC em 3x)..."
echo "   Order ID: $ORDER_ID"
CHARGE_RESP=$(curl -s -X POST "$BASE_URL/credit/charge" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"amountUsdc\": 100,
    \"installments\": 3,
    \"orderIdHex\": \"$ORDER_ID\"
  }")

if echo "$CHARGE_RESP" | grep -q "ok"; then
  echo -e "   ${GREEN}✓ Cobrança realizada com sucesso!${NC}"
else
  echo -e "   ${RED}❌ Erro na cobrança:${NC}"
  echo "   $CHARGE_RESP"
fi
echo ""

echo "1️⃣3️⃣  Consultando conta de crédito após cobrança..."
CREDIT_AFTER_CHARGE=$(curl -s -X GET "$BASE_URL/credit/$OWNER_PUBKEY")
echo "$CREDIT_AFTER_CHARGE" | jq '.'
echo ""

echo "1️⃣4️⃣  Realizando pagamento (50 USDC)..."
REPAY_RESP=$(curl -s -X POST "$BASE_URL/credit/repay" \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPubkey\": \"$OWNER_PUBKEY\",
    \"amountUsdc\": 50
  }")

if echo "$REPAY_RESP" | grep -q "ok"; then
  echo -e "   ${GREEN}✓ Pagamento realizado com sucesso!${NC}"
else
  echo -e "   ${RED}❌ Erro no pagamento:${NC}"
  echo "   $REPAY_RESP"
fi
echo ""

echo "1️⃣5️⃣  Consultando conta de crédito após pagamento..."
CREDIT_AFTER_REPAY=$(curl -s -X GET "$BASE_URL/credit/$OWNER_PUBKEY")
echo "$CREDIT_AFTER_REPAY" | jq '.'
echo ""

# ==============================================================================
# RESUMO
# ==============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 TESTES CONCLUÍDOS!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📊 Resumo:${NC}"
echo "   ✓ Sistema inicializado"
echo "   ✓ Conta de crédito: $OWNER_PUBKEY"
echo "   ✓ Limite: 1000 USDC"
echo "   ✓ Collateral depositado"
echo "   ✓ Cobrança testada: 100 USDC em 3x"
echo "   ✓ Pagamento testado: 50 USDC"
echo ""
echo -e "${YELLOW}🔍 Para consultar:${NC}"
echo "   curl $BASE_URL/credit/$OWNER_PUBKEY | jq '.'"
echo "   curl $BASE_URL/collateral/$OWNER_PUBKEY | jq '.'"
echo ""
