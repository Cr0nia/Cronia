import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateConsumerDto } from './dto/consumer.dto';

@Injectable()
export class ConsumersService {
  private readonly logger = new Logger(ConsumersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const consumer = await this.prisma.consumer.findUnique({
      where: { id },
      include: {
        creditAccounts: {
          include: {
            collateralDeposits: true,
            invoices: {
              where: { status: 'pending' },
              take: 5,
              orderBy: { dueDate: 'asc' },
            },
          },
        },
      },
    });

    if (!consumer) {
      throw new NotFoundException('Consumer not found');
    }

    return consumer;
  }

  async findByWallet(walletAddress: string) {
    return this.prisma.consumer.findUnique({
      where: { walletAddress },
      include: {
        creditAccounts: true,
      },
    });
  }

  async update(id: string, dto: UpdateConsumerDto) {
    const consumer = await this.prisma.consumer.findUnique({
      where: { id },
    });

    if (!consumer) {
      throw new NotFoundException('Consumer not found');
    }

    return this.prisma.consumer.update({
      where: { id },
      data: dto,
    });
  }

  async getCreditAccounts(consumerId: string) {
    return this.prisma.creditAccount.findMany({
      where: { consumerId },
      include: {
        collateralDeposits: true,
        invoices: {
          where: {
            status: {
              in: ['pending', 'overdue'],
            },
          },
        },
      },
    });
  }

  async getTransactionHistory(consumerId: string, limit = 50) {
    return this.prisma.transaction.findMany({
      where: { consumerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
