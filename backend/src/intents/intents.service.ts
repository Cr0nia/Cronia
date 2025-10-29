import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

function buildQrPayload(intent: { id: string; merchantId: string; amountUsdc: number; currency: string; description?: string }) {
  const payload = {
    type: 'cronia_intent',
    intentId: intent.id,
    merchantId: intent.merchantId,
    amountUsdc: intent.amountUsdc,
    currency: intent.currency,
    description: intent.description ?? null,
    version: 1,
  };
  const base64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const uri = `cronia://pay?intent=${intent.id}`;
  return { payload, base64, uri };
}

@Injectable()
export class IntentsService {
  constructor(private prisma: PrismaService) {}

  /** Merchant cria uma intent (QR) */
  async createByMerchant(merchantId: string, data: { amountUsdc: number; currency: string; description?: string; maxInstallments?: number; expiresInSec?: number; }) {
    // valida políticas simples
    const m = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!m) throw new NotFoundException('Merchant not found');
    if (data.amountUsdc < (m.minTicket ?? 0)) {
      throw new ForbiddenException('Amount below merchant minTicket');
    }
    const maxInst = data.maxInstallments ?? m.maxInstallments ?? 12;

    const expiresAt = data.expiresInSec ? new Date(Date.now() + data.expiresInSec * 1000) : null;

    const intent = await this.prisma.paymentIntent.create({
      data: {
        merchantId,
        amountUsdc: data.amountUsdc,
        currency: data.currency,
        description: data.description,
        maxInstallments: maxInst,
        status: 'created',
        expiresAt,
      },
    });

    const qr = buildQrPayload({ id: intent.id, merchantId, amountUsdc: intent.amountUsdc, currency: intent.currency, description: intent.description ?? undefined });
    return { intentId: intent.id, qr: qr.base64, uri: qr.uri, expiresAt };
  }

  /** Cliente confirma a intent (apenas marca como confirmed aqui; a autorização/charge virá na próxima etapa) */
  async confirmIntent(intentId: string, ownerPubkey?: string, orderIdExt?: string) {
    const intent = await this.prisma.paymentIntent.findUnique({ where: { id: intentId } });
    if (!intent) throw new NotFoundException('Intent not found');
    if (intent.status !== 'created') throw new ForbiddenException('Intent not in created state');

    const updated = await this.prisma.paymentIntent.update({
      where: { id: intentId },
      data: {
        status: 'confirmed',
        ownerPubkey: ownerPubkey ?? intent.ownerPubkey,
        orderIdExt: orderIdExt ?? intent.orderIdExt,
      },
    });
    return { intentId: updated.id, status: updated.status, ownerPubkey: updated.ownerPubkey };
  }
}
