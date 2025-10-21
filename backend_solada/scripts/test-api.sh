#!/bin/bash

API_URL="http://localhost:3000/v1"

echo "🧪 Cronia API Test Suite"
echo "========================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$API_URL/health" | jq .
echo ""

# Test 2: Get Auth Challenge
echo "2️⃣  Testing Auth Challenge..."
WALLET="TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA"
CHALLENGE=$(curl -s -X POST "$API_URL/auth/challenge" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$WALLET\"}")

echo "$CHALLENGE" | jq .
echo ""

# Note: For real authentication, you would need to sign the message with the wallet
echo "⚠️  Note: To complete authentication, you need to:"
echo "   1. Take the message from the challenge"
echo "   2. Sign it with your Solana wallet"
echo "   3. Send the signature to /v1/auth/verify"
echo ""

# Test 3: Get Merchant Profile (requires auth)
echo "3️⃣  Test endpoints that require authentication:"
echo "   GET $API_URL/consumers/me (requires Bearer token)"
echo "   GET $API_URL/merchants/me (requires Bearer token)"
echo ""

echo "✅ Basic tests completed!"
echo ""
echo "📖 Full API documentation: http://localhost:3000/docs"
echo ""
