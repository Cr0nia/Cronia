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

    async listSales(merchantId: string, params?: { status?: string; from?: Date; to?: Date }) {
    const m = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!m) throw new NotFoundException('Merchant not found');

    const where = {
        merchantId,
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.from || params?.to
            ? { createdAt: { gte: params.from ?? undefined, lte: params.to ?? undefined } }
            : {}),
    };

    const rows = await this.prisma.paymentIntent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return rows;
  }

  async metrics(merchantId: string, params?: { from?: Date; to?: Date }) {
    const m = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!m) throw new NotFoundException('Merchant not found');

    const baseWhere = {
    merchantId,
    ...(params?.from || params?.to
        ? { createdAt: { gte: params.from ?? undefined, lte: params.to ?? undefined } }
        : {}),
    };

    const [total, confirmed, createdSum, confirmedSum] = await Promise.all([
      this.prisma.paymentIntent.count({ where: baseWhere }),
      this.prisma.paymentIntent.count({ where: { ...baseWhere, status: 'confirmed' } }),
      this.prisma.paymentIntent.aggregate({
        _sum: { amountUsdc: true },
        where: baseWhere,
      }),
      this.prisma.paymentIntent.aggregate({
        _sum: { amountUsdc: true },
        where: { ...baseWhere, status: 'confirmed' },
      }),
    ]);

    return {
      merchantId,
      totalIntents: total,
      confirmedIntents: confirmed,
      volumeCreatedUsdc: Math.round(createdSum._sum.amountUsdc ?? 0),
      volumeConfirmedUsdc: Math.round(confirmedSum._sum.amountUsdc ?? 0),
      takeRateBps: m.takeRateBps,
      avgTakeOnConfirmedUsdc: Math.round(((confirmedSum._sum.amountUsdc ?? 0) * m.takeRateBps) / 10_000),
    };
  }

  async reportCsv(merchantId: string, params?: { from?: Date; to?: Date }) {
    const rows = await this.listSales(merchantId, { from: params?.from, to: params?.to });
    const header = 'id,createdAt,status,amountUsdc,currency,description,ownerPubkey,orderIdExt\n';
    const body = rows
      .map(r =>
        [
          r.id,
          r.createdAt.toISOString(),
          r.status,
          r.amountUsdc,
          r.currency,
          (r.description ?? '').replaceAll(',', ' '),
          r.ownerPubkey ?? '',
          r.orderIdExt ?? '',
        ].join(','),
      )
      .join('\n');
    return header + body + '\n';
  }

  async requestAdvanceStub(merchantId: string, payload: { minNetUsdc?: number }) {
    const m = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!m) throw new NotFoundException('Merchant not found');
    return {
      ok: false,
      status: 'not_implemented_yet',
      message: 'advance_pool integration pending — will pick eligible receivables and call on-chain',
      merchantId,
      minNetUsdc: payload.minNetUsdc ?? null,
    };
  }
}
