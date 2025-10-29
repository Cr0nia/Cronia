-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "kycLevel" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "pubkey" TEXT NOT NULL,
    "aaRef" TEXT,
    "custodied" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditAccount" (
    "ownerPubkey" TEXT NOT NULL,
    "limitUsdc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usedUsdc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healthFactor" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "score" INTEGER NOT NULL DEFAULT 600,
    "billingDay" INTEGER NOT NULL DEFAULT 15,
    "status" TEXT NOT NULL DEFAULT 'active',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "CreditAccount_pkey" PRIMARY KEY ("ownerPubkey")
);

-- CreateTable
CREATE TABLE "CollateralPosition" (
    "id" TEXT NOT NULL,
    "ownerPubkey" TEXT NOT NULL,
    "mint" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "valuation" DOUBLE PRECISION NOT NULL,
    "ltvBps" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollateralPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "mint" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "defaultLtvBps" INTEGER NOT NULL,
    "haircutBps" INTEGER NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("mint")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "mint" TEXT NOT NULL,
    "priceUsdc" DOUBLE PRECISION NOT NULL,
    "lastTs" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cnpj" TEXT,
    "category" TEXT,
    "apiKeyHash" TEXT,
    "callbackUrl" TEXT,
    "takeRateBps" INTEGER NOT NULL DEFAULT 180,
    "maxInstallments" INTEGER NOT NULL DEFAULT 12,
    "minTicket" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "clientPubkey" TEXT NOT NULL,
    "totalUsdc" DOUBLE PRECISION NOT NULL,
    "installments" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "txSig" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceivableNote" (
    "notePda" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "amountUsdc" DOUBLE PRECISION NOT NULL,
    "dueTs" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saleId" TEXT,

    CONSTRAINT "ReceivableNote_pkey" PRIMARY KEY ("notePda")
);

-- CreateTable
CREATE TABLE "Statement" (
    "id" TEXT NOT NULL,
    "ownerPubkey" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "closeTs" TIMESTAMP(3) NOT NULL,
    "totalDue" DOUBLE PRECISION NOT NULL,
    "minPayment" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatementItem" (
    "id" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountUsdc" DOUBLE PRECISION NOT NULL,
    "metaJson" JSONB NOT NULL,

    CONSTRAINT "StatementItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolAdvance" (
    "id" TEXT NOT NULL,
    "notePda" TEXT NOT NULL,
    "grossUsdc" DOUBLE PRECISION NOT NULL,
    "discountUsdc" DOUBLE PRECISION NOT NULL,
    "netUsdc" DOUBLE PRECISION NOT NULL,
    "tx" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "maxValue" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnchainEvent" (
    "id" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "sig" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnchainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_pubkey_key" ON "Wallet"("pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "CreditAccount_userId_key" ON "CreditAccount"("userId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycRequest" ADD CONSTRAINT "KycRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditAccount" ADD CONSTRAINT "CreditAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceivableNote" ADD CONSTRAINT "ReceivableNote_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementItem" ADD CONSTRAINT "StatementItem_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "Statement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
