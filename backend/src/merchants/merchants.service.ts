import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMerchantDto } from './dto';
import { makeMerchantApiKey } from '../common/api-key.util';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMerchantDto) {
    const { apiKey, apiKeyHash } = makeMerchantApiKey();
    const m = await this.prisma.merchant.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cnpj: dto.cnpj,
        category: dto.category,
        callbackUrl: dto.callbackUrl,
        takeRateBps: dto.takeRateBps ?? 180,
        maxInstallments: dto.maxInstallments ?? 12,
        minTicket: dto.minTicket ?? 10,
        apiKeyHash,
      },
    });
    return { merchantId: m.id, apiKey };
  }

  async get(merchantId: string) {
    const m = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!m) throw new NotFoundException('Merchant not found');
    // não retornar hash
    const { apiKeyHash, ...safe } = m as any;
    return safe;
  }

  async rotateKey(merchantId: string) {
    const m = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!m) throw new NotFoundException('Merchant not found');
    const { apiKey, apiKeyHash } = makeMerchantApiKey();
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: { apiKeyHash },
    });
    return { merchantId, apiKey };
  }
}
