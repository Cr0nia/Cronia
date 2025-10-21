import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test consumer
  const consumer = await prisma.consumer.upsert({
    where: { walletAddress: 'TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA' },
    update: {},
    create: {
      walletAddress: 'TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA',
      email: 'consumer@test.com',
      phone: '+55 11 98765-4321',
      fullName: 'João Silva',
      cpf: '123.456.789-00',
      kycStatus: 'approved',
    },
  });

  console.log('✅ Consumer created:', consumer.id);

  // Create test merchant
  const merchant = await prisma.merchant.upsert({
    where: { walletAddress: 'TestMerchant8yLYug3DX98e08UYKTEqcE6kCifuUrB' },
    update: {},
    create: {
      walletAddress: 'TestMerchant8yLYug3DX98e08UYKTEqcE6kCifuUrB',
      businessName: 'Loja Teste Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'merchant@test.com',
      phone: '+55 11 91234-5678',
      kycStatus: 'approved',
      apiKey: 'cronia_test_api_key_123456789',
      webhookUrl: 'https://webhook.test.com/cronia',
    },
  });

  console.log('✅ Merchant created:', merchant.id);

  // Create credit account for consumer
  const creditAccount = await prisma.creditAccount.create({
    data: {
      consumerId: consumer.id,
      pdaAddress: 'TestPDA9zMYvh4FW99f09VZLTFrdF7hDjwVuE',
      creditLimit: new Prisma.Decimal(1000),
      availableCredit: new Prisma.Decimal(800),
      usedCredit: new Prisma.Decimal(200),
      totalCollateral: new Prisma.Decimal(250),
      healthFactor: new Prisma.Decimal(1.25),
      interestRate: new Prisma.Decimal(0.0299), // 2.99%
      status: 'active',
    },
  });

  console.log('✅ Credit account created:', creditAccount.id);

  // Create collateral deposit
  const collateral = await prisma.collateralDeposit.create({
    data: {
      creditAccountId: creditAccount.id,
      consumerId: consumer.id,
      tokenMint: 'So11111111111111111111111111111111111111112', // SOL
      tokenType: 'SPL',
      amount: new Prisma.Decimal(2.5),
      valueUsd: new Prisma.Decimal(250),
      ltv: new Prisma.Decimal(0.8),
      status: 'active',
    },
  });

  console.log('✅ Collateral deposit created:', collateral.id);

  // Create checkout session
  const checkoutSession = await prisma.checkoutSession.create({
    data: {
      merchantId: merchant.id,
      consumerId: consumer.id,
      sessionToken: 'cs_test_session_token_123456789',
      amount: new Prisma.Decimal(150),
      currency: 'BRL',
      status: 'approved',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      metadata: {
        orderId: 'ORDER-001',
        items: [
          { name: 'Product 1', quantity: 2, price: 75 },
        ],
      },
    },
  });

  console.log('✅ Checkout session created:', checkoutSession.id);

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      creditAccountId: creditAccount.id,
      billingCycle: '2025-01',
      dueDate: new Date('2025-02-01'),
      totalAmount: new Prisma.Decimal(205.98),
      principalAmount: new Prisma.Decimal(200),
      interestAmount: new Prisma.Decimal(5.98), // 2.99% of 200
      feesAmount: new Prisma.Decimal(0),
      paidAmount: new Prisma.Decimal(0),
      status: 'pending',
    },
  });

  console.log('✅ Invoice created:', invoice.id);

  // Create receivable
  const receivable = await prisma.receivable.create({
    data: {
      merchantId: merchant.id,
      checkoutSessionId: checkoutSession.id,
      invoiceId: invoice.id,
      amount: new Prisma.Decimal(150),
      currency: 'BRL',
      status: 'settled',
      settledAt: new Date(),
    },
  });

  console.log('✅ Receivable created:', receivable.id);

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      creditAccountId: creditAccount.id,
      consumerId: consumer.id,
      type: 'purchase',
      amount: new Prisma.Decimal(150),
      status: 'confirmed',
      txSignature: 'TestTx5yJKug3DW87e97UXJTEqcE5kChfvVrC',
      metadata: {
        sessionId: checkoutSession.id,
        merchantId: merchant.id,
      },
    },
  });

  console.log('✅ Transaction created:', transaction.id);

  // Create system config
  await prisma.systemConfig.upsert({
    where: { key: 'min_health_factor' },
    update: {},
    create: {
      key: 'min_health_factor',
      value: '1.2',
      description: 'Minimum health factor before freezing account',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'liquidation_threshold' },
    update: {},
    create: {
      key: 'liquidation_threshold',
      value: '1.1',
      description: 'Health factor threshold for liquidation',
    },
  });

  console.log('✅ System config created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Consumer: ${consumer.walletAddress}`);
  console.log(`  - Merchant: ${merchant.walletAddress}`);
  console.log(`  - Credit Account: ${creditAccount.id}`);
  console.log(`  - Invoice: ${invoice.id} (${invoice.status})`);
  console.log(`  - Collateral: $${collateral.valueUsd}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
