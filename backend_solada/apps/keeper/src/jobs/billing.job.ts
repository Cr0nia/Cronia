import { PrismaClient } from '@prisma/client';
import { Logger } from 'pino';

export class BillingJob {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
  ) {}

  async execute() {
    try {
      this.logger.info('Starting billing cycle...');

      // Get all active credit accounts
      const creditAccounts = await this.prisma.creditAccount.findMany({
        where: {
          status: 'active',
          usedCredit: {
            gt: 0,
          },
        },
      });

      this.logger.info(`Found ${creditAccounts.length} accounts to bill`);

      const billingCycle = this.getCurrentBillingCycle();

      for (const account of creditAccounts) {
        try {
          // Check if invoice already exists for this cycle
          const existingInvoice = await this.prisma.invoice.findFirst({
            where: {
              creditAccountId: account.id,
              billingCycle,
            },
          });

          if (existingInvoice) {
            this.logger.debug(`Invoice already exists for account ${account.id}`);
            continue;
          }

          // Calculate amounts
          const principalAmount = account.usedCredit;
          const interestAmount = principalAmount.mul(account.interestRate);
          const totalAmount = principalAmount.add(interestAmount);

          // Create invoice
          const dueDate = this.getNextDueDate();

          const invoice = await this.prisma.invoice.create({
            data: {
              creditAccountId: account.id,
              billingCycle,
              dueDate,
              totalAmount,
              principalAmount,
              interestAmount,
              feesAmount: 0,
              status: 'pending',
            },
          });

          this.logger.info(`Created invoice ${invoice.id} for account ${account.id}`);
        } catch (error) {
          this.logger.error(`Failed to create invoice for account ${account.id}: ${error.message}`);
        }
      }

      this.logger.info('Billing cycle completed');
    } catch (error) {
      this.logger.error(`Billing job failed: ${error.message}`);
      throw error;
    }
  }

  private getCurrentBillingCycle(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private getNextDueDate(): Date {
    const now = new Date();
    const dueDay = parseInt(process.env.BILLING_CYCLE_DAY || '1');

    // Set to next month, day 1 (or configured day)
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);

    return dueDate;
  }
}
