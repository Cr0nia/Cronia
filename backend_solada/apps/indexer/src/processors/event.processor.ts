import { PrismaClient } from '@prisma/client';
import { Logger } from 'pino';

export class EventProcessor {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
  ) {}

  async processPendingEvents() {
    const events = await this.prisma.blockchainEvent.findMany({
      where: {
        processed: false,
      },
      orderBy: {
        blockTime: 'asc',
      },
      take: 100,
    });

    if (events.length === 0) {
      return;
    }

    this.logger.info(`Processing ${events.length} blockchain events`);

    for (const event of events) {
      try {
        await this.processEvent(event);

        await this.prisma.blockchainEvent.update({
          where: { id: event.id },
          data: {
            processed: true,
            processedAt: new Date(),
          },
        });

        this.logger.info(`Processed event ${event.id} (${event.eventType})`);
      } catch (error) {
        this.logger.error(`Failed to process event ${event.id}: ${error.message}`);
      }
    }
  }

  private async processEvent(event: any) {
    switch (event.eventType) {
      case 'deposit':
        await this.handleDepositEvent(event);
        break;

      case 'withdrawal':
        await this.handleWithdrawalEvent(event);
        break;

      case 'payment':
        await this.handlePaymentEvent(event);
        break;

      case 'liquidation':
        await this.handleLiquidationEvent(event);
        break;

      default:
        this.logger.warn(`Unknown event type: ${event.eventType}`);
    }
  }

  private async handleDepositEvent(event: any) {
    const payload = event.payload;

    // Update collateral deposit status
    if (payload.depositId) {
      await this.prisma.collateralDeposit.update({
        where: { id: payload.depositId },
        data: { status: 'active' },
      });
    }

    // Update transaction status
    if (payload.transactionId) {
      await this.prisma.transaction.update({
        where: { id: payload.transactionId },
        data: {
          status: 'confirmed',
          txSignature: event.txSignature,
        },
      });
    }

    this.logger.info(`Deposit confirmed: ${event.txSignature}`);
  }

  private async handleWithdrawalEvent(event: any) {
    const payload = event.payload;

    // Update collateral deposit status
    if (payload.depositId) {
      await this.prisma.collateralDeposit.update({
        where: { id: payload.depositId },
        data: { status: 'withdrawn' },
      });
    }

    // Update transaction status
    if (payload.transactionId) {
      await this.prisma.transaction.update({
        where: { id: payload.transactionId },
        data: {
          status: 'confirmed',
          txSignature: event.txSignature,
        },
      });
    }

    this.logger.info(`Withdrawal confirmed: ${event.txSignature}`);
  }

  private async handlePaymentEvent(event: any) {
    const payload = event.payload;

    // Update payment status
    if (payload.paymentId) {
      await this.prisma.payment.update({
        where: { id: payload.paymentId },
        data: {
          status: 'confirmed',
          txSignature: event.txSignature,
        },
      });
    }

    this.logger.info(`Payment confirmed: ${event.txSignature}`);
  }

  private async handleLiquidationEvent(event: any) {
    const payload = event.payload;

    // Update collateral deposits to liquidated
    if (payload.creditAccountId) {
      await this.prisma.collateralDeposit.updateMany({
        where: {
          creditAccountId: payload.creditAccountId,
          status: 'active',
        },
        data: { status: 'liquidated' },
      });

      await this.prisma.creditAccount.update({
        where: { id: payload.creditAccountId },
        data: { status: 'liquidated' },
      });
    }

    this.logger.info(`Liquidation confirmed: ${event.txSignature}`);
  }
}
