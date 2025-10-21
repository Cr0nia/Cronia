import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMerchantDto, UpdateMerchantDto } from './dto/merchant.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class MerchantsService {
  private readonly logger = new Logger(MerchantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMerchantDto) {
    // Check if merchant already exists
    const existing = await this.prisma.merchant.findUnique({
      where: { walletAddress: dto.walletAddress },
    });

    if (existing) {
      throw new ConflictException('Merchant with this wallet already exists');
    }

    if (dto.email) {
      const existingEmail = await this.prisma.merchant.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Merchant with this email already exists');
      }
    }

    // Generate API key
    const apiKey = this.generateApiKey();

    const merchant = await this.prisma.merchant.create({
      data: {
        ...dto,
        apiKey,
        kycStatus: 'pending',
      },
    });

    this.logger.log(`Merchant created: ${merchant.id}`);

    return merchant;
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        receivables: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        checkoutSessions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async findByWallet(walletAddress: string) {
    return this.prisma.merchant.findUnique({
      where: { walletAddress },
    });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.merchant.findUnique({
      where: { apiKey },
    });
  }

  async update(id: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return this.prisma.merchant.update({
      where: { id },
      data: dto,
    });
  }

  async regenerateApiKey(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const apiKey = this.generateApiKey();

    return this.prisma.merchant.update({
      where: { id },
      data: { apiKey },
    });
  }

  async getReceivables(merchantId: string, status?: string) {
    const where: any = { merchantId };

    if (status) {
      where.status = status;
    }

    return this.prisma.receivable.findMany({
      where,
      include: {
        checkoutSession: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateApiKey(): string {
    return `cronia_${randomBytes(32).toString('hex')}`;
  }
}
