import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalConsumers,
      totalMerchants,
      totalCreditAccounts,
      totalCollateral,
      totalReceivables,
      pendingInvoices,
    ] = await Promise.all([
      this.prisma.consumer.count(),
      this.prisma.merchant.count(),
      this.prisma.creditAccount.count(),
      this.prisma.collateralDeposit.aggregate({
        _sum: { valueUsd: true },
      }),
      this.prisma.receivable.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.invoice.count({
        where: { status: 'pending' },
      }),
    ]);

    return {
      totalConsumers,
      totalMerchants,
      totalCreditAccounts,
      totalCollateralUsd: totalCollateral._sum.valueUsd || 0,
      totalReceivables: totalReceivables._sum.amount || 0,
      pendingInvoices,
    };
  }

  async getRecentActivity(limit = 50) {
    return this.prisma.transaction.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        consumer: {
          select: {
            walletAddress: true,
          },
        },
      },
    });
  }

  async getCreditAccounts(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.creditAccount.findMany({
      where,
      include: {
        consumer: {
          select: {
            id: true,
            walletAddress: true,
            fullName: true,
          },
        },
        collateralDeposits: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
