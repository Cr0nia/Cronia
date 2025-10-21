import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import cron from 'node-cron';
import { BillingJob } from './jobs/billing.job';
import { RiskMonitorJob } from './jobs/risk-monitor.job';
import { LiquidationJob } from './jobs/liquidation.job';

const logger = pino({
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true },
  } : undefined,
});

const prisma = new PrismaClient();

async function bootstrap() {
  logger.info('🚀 Cronia Keeper starting...');

  const billingJob = new BillingJob(prisma, logger);
  const riskMonitorJob = new RiskMonitorJob(prisma, logger);
  const liquidationJob = new LiquidationJob(prisma, logger);

  // Run billing job daily at 00:00
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running billing job...');
    await billingJob.execute();
  });

  // Run risk monitor every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running risk monitor job...');
    await riskMonitorJob.execute();
  });

  // Run liquidation check every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running liquidation job...');
    await liquidationJob.execute();
  });

  logger.info('✅ Keeper started successfully');
  logger.info('📅 Scheduled jobs:');
  logger.info('  - Billing: Daily at 00:00');
  logger.info('  - Risk Monitor: Every 5 minutes');
  logger.info('  - Liquidation: Every hour');
}

bootstrap().catch((error) => {
  logger.error(error, 'Failed to start Keeper');
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down Keeper...');
  await prisma.$disconnect();
  process.exit(0);
});
