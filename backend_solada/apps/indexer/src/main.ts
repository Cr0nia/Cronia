import { Connection, PublicKey } from '@solana/web3.js';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import { EventProcessor } from './processors/event.processor';

const logger = pino({
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true },
  } : undefined,
});

const prisma = new PrismaClient();

async function bootstrap() {
  logger.info('🚀 Cronia Indexer starting...');

  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  logger.info(`Connected to Solana RPC: ${rpcUrl}`);

  const eventProcessor = new EventProcessor(prisma, logger);

  // In a real implementation, this would listen to on-chain program logs
  // For now, we'll implement a mock listener that processes events from a queue

  logger.info('✅ Indexer started successfully');
  logger.info('📡 Listening for blockchain events...');

  // Mock event polling (in production, use WebSocket subscriptions)
  setInterval(async () => {
    try {
      // Process any pending blockchain events
      await eventProcessor.processPendingEvents();
    } catch (error) {
      logger.error(error, 'Error processing events');
    }
  }, 10000); // Every 10 seconds
}

bootstrap().catch((error) => {
  logger.error(error, 'Failed to start Indexer');
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down Indexer...');
  await prisma.$disconnect();
  process.exit(0);
});
