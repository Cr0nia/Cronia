import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReceivablesService {
  private readonly logger = new Logger(ReceivablesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(merchantId?: string, status?: string) {
    const where: any = {};

    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;

    return this.prisma.receivable.findMany({
      where,
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            walletAddress: true,
          },
        },
        checkoutSession: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const receivable = await this.prisma.receivable.findUnique({
      where: { id },
      include: {
        merchant: true,
        checkoutSession: true,
        invoice: true,
      },
    });

    if (!receivable) {
      throw new NotFoundException('Receivable not found');
    }

    return receivable;
  }

  async markAsSettled(id: string, invoiceId: string) {
    const receivable = await this.findOne(id);

    return this.prisma.receivable.update({
      where: { id },
      data: {
        status: 'settled',
        settledAt: new Date(),
        invoiceId,
      },
    });
  }
}
