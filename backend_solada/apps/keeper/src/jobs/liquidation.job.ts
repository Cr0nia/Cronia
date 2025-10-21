import { PrismaClient } from '@prisma/client';
import { Logger } from 'pino';

export class LiquidationJob {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
  ) {}

  async execute() {
    try {
      this.logger.info('Starting liquidation check...');

      const gracePeriodDays = parseInt(process.env.BILLING_GRACE_PERIOD_DAYS || '15');
      const liquidationDays = parseInt(process.env.BILLING_LIQUIDATION_DAYS || '30');

      // Find overdue invoices
      const now = new Date();
      const overdueThreshold = new Date(now.getTime() - gracePeriodDays * 24 * 60 * 60 * 1000);
      const liquidationThreshold = new Date(now.getTime() - liquidationDays * 24 * 60 * 60 * 1000);

      // Mark invoices as overdue (D+15)
      const overdueInvoices = await this.prisma.invoice.findMany({
        where: {
          status: 'pending',
          dueDate: {
            lt: overdueThreshold,
          },
        },
      });

      for (const invoice of overdueInvoices) {
        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'overdue' },
        });

        this.logger.warn(`Invoice ${invoice.id} marked as overdue`);
      }

      // Liquidate accounts with very overdue invoices (D+30)
      const liquidatableInvoices = await this.prisma.invoice.findMany({
        where: {
          status: 'overdue',
          dueDate: {
            lt: liquidationThreshold,
          },
        },
        include: {
          creditAccount: {
            include: {
              collateralDeposits: {
                where: {
                  status: 'active',
                },
              },
            },
          },
        },
      });

      this.logger.info(`Found ${liquidatableInvoices.length} invoices for liquidation`);

      for (const invoice of liquidatableInvoices) {
        try {
          // Mark invoice as liquidated
          await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'liquidated' },
          });

          // Mark credit account as liquidated
          await this.prisma.creditAccount.update({
            where: { id: invoice.creditAccountId },
            data: { status: 'liquidated' },
          });

          // Liquidate all collateral deposits
          for (const deposit of invoice.creditAccount.collateralDeposits) {
            await this.prisma.collateralDeposit.update({
              where: { id: deposit.id },
              data: { status: 'liquidated' },
            });

            // Create liquidation transaction
            await this.prisma.transaction.create({
              data: {
                creditAccountId: invoice.creditAccountId,
                consumerId: invoice.creditAccount.consumerId,
                type: 'liquidation',
                amount: deposit.amount,
                tokenMint: deposit.tokenMint,
                status: 'confirmed',
                metadata: {
                  invoiceId: invoice.id,
                  depositId: deposit.id,
                  reason: 'overdue_payment',
                },
              },
            });

            this.logger.info(`Liquidated collateral ${deposit.id}`);
          }

          this.logger.warn(`Account ${invoice.creditAccountId} fully liquidated`);
        } catch (error) {
          this.logger.error(`Failed to liquidate invoice ${invoice.id}: ${error.message}`);
        }
      }

      this.logger.info('Liquidation check completed');
    } catch (error) {
      this.logger.error(`Liquidation job failed: ${error.message}`);
      throw error;
    }
  }
}
