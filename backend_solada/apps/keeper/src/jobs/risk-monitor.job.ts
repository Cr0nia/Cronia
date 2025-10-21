import { PrismaClient, Prisma } from '@prisma/client';
import { Logger } from 'pino';

export class RiskMonitorJob {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
  ) {}

  async execute() {
    try {
      this.logger.info('Starting risk monitoring...');

      // Get all active credit accounts
      const creditAccounts = await this.prisma.creditAccount.findMany({
        where: {
          status: {
            in: ['active', 'frozen'],
          },
        },
        include: {
          collateralDeposits: {
            where: {
              status: 'active',
            },
          },
        },
      });

      this.logger.info(`Monitoring ${creditAccounts.length} credit accounts`);

      const minHealthFactor = parseFloat(process.env.MIN_HEALTH_FACTOR || '1.2');
      const liquidationThreshold = parseFloat(process.env.LIQUIDATION_THRESHOLD || '1.1');

      for (const account of creditAccounts) {
        try {
          // Calculate total collateral value
          const totalCollateral = account.collateralDeposits.reduce(
            (sum, deposit) => sum.add(deposit.valueUsd),
            new Prisma.Decimal(0),
          );

          // Calculate health factor
          const healthFactor = account.usedCredit.gt(0)
            ? totalCollateral.div(account.usedCredit)
            : new Prisma.Decimal(999);

          // Update account health factor
          await this.prisma.creditAccount.update({
            where: { id: account.id },
            data: {
              healthFactor,
              totalCollateral,
            },
          });

          // Check if account should be frozen
          if (healthFactor.toNumber() < minHealthFactor && account.status === 'active') {
            await this.prisma.creditAccount.update({
              where: { id: account.id },
              data: { status: 'frozen' },
            });

            this.logger.warn(
              `Account ${account.id} frozen - Health factor: ${healthFactor.toFixed(2)}`,
            );
          }

          // Check if account should be liquidated
          if (healthFactor.toNumber() < liquidationThreshold) {
            await this.prisma.creditAccount.update({
              where: { id: account.id },
              data: { status: 'liquidating' },
            });

            this.logger.error(
              `Account ${account.id} marked for liquidation - Health factor: ${healthFactor.toFixed(2)}`,
            );
          }

          // Unfreeze if health factor recovered
          if (healthFactor.toNumber() >= minHealthFactor && account.status === 'frozen') {
            await this.prisma.creditAccount.update({
              where: { id: account.id },
              data: { status: 'active' },
            });

            this.logger.info(`Account ${account.id} unfrozen - Health factor recovered`);
          }
        } catch (error) {
          this.logger.error(`Failed to monitor account ${account.id}: ${error.message}`);
        }
      }

      this.logger.info('Risk monitoring completed');
    } catch (error) {
      this.logger.error(`Risk monitor job failed: ${error.message}`);
      throw error;
    }
  }
}
