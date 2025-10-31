import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Processa webhook do Helius (eventos blockchain)
   */
  async processHeliusWebhook(payload: any) {
    this.logger.log('Processing Helius webhook...');

    try {
      const { type, transaction, events } = payload;

      // Registrar evento on-chain
      if (transaction) {
        const event = await this.prisma.onchainEvent.create({
          data: {
            program: transaction.program || 'unknown',
            event: type,
            slot: transaction.slot || 0,
            sig: transaction.signature || '',
            payload: payload,
          },
        });

        this.logger.log(`Helius event stored: ${event.id}`);
      }

      // Processar eventos específicos
      if (events) {
        for (const evt of events) {
          await this.handleBlockchainEvent(evt);
        }
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error: any) {
      this.logger.error('Failed to process Helius webhook:', error);
      throw error;
    }
  }

  /**
   * Envia webhook para lojista
   */
  async sendMerchantWebhook(merchantId: string, event: string, data: any) {
    this.logger.log(`Sending webhook to merchant ${merchantId}: ${event}`);

    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
      });

      if (!merchant || !merchant.callbackUrl) {
        this.logger.warn(`Merchant ${merchantId} has no callback URL`);
        return;
      }

      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        merchantId,
      };

      // Tentar enviar webhook
      const response = await firstValueFrom(
        this.httpService.post(merchant.callbackUrl, payload, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'X-Cronia-Event': event,
            'X-Cronia-Merchant-Id': merchantId,
          },
        }),
      );

      // Registrar sucesso
      await this.prisma.webhook.create({
        data: {
          target: `merchant:${merchantId}`,
          url: merchant.callbackUrl,
          payload: payload,
          status: 'success',
          attempts: 1,
        },
      });

      this.logger.log(`Webhook sent to merchant ${merchantId}: ${response.status}`);

      return {
        success: true,
        status: response.status,
      };
    } catch (error: any) {
      this.logger.error(`Failed to send webhook to merchant ${merchantId}:`, error);

      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
      });

      // Registrar falha
      await this.prisma.webhook.create({
        data: {
          target: `merchant:${merchantId}`,
          url: merchant?.callbackUrl || '',
          payload: { event, data },
          status: 'failed',
          attempts: 1,
          lastError: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Processa um evento blockchain específico
   */
  private async handleBlockchainEvent(event: any) {
    const { type, data } = event;

    switch (type) {
      case 'ChargeAuthorized':
        await this.handleChargeAuthorized(data);
        break;
      case 'NoteIssued':
        await this.handleNoteIssued(data);
        break;
      case 'AdvanceExecuted':
        await this.handleAdvanceExecuted(data);
        break;
      default:
        this.logger.log(`Unknown event type: ${type}`);
    }
  }

  private async handleChargeAuthorized(data: any) {
    this.logger.log('Handling ChargeAuthorized event');
    // TODO: Processar cobrança autorizada
  }

  private async handleNoteIssued(data: any) {
    this.logger.log('Handling NoteIssued event');
    // TODO: Processar nota emitida
  }

  private async handleAdvanceExecuted(data: any) {
    this.logger.log('Handling AdvanceExecuted event');
    // TODO: Processar antecipação executada
  }

  /**
   * Lista webhooks enviados
   */
  async getWebhooks(target?: string, limit = 50) {
    const webhooks = await this.prisma.webhook.findMany({
      where: target ? { target } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      webhooks,
      count: webhooks.length,
    };
  }

  /**
   * Retry de webhook falhado
   */
  async retryWebhook(webhookId: string) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    if (webhook.status === 'success') {
      return {
        message: 'Webhook already succeeded',
      };
    }

    // Extrair merchantId do target
    const merchantId = webhook.target.replace('merchant:', '');

    // Tentar reenviar
    const payload = webhook.payload as any;
    return await this.sendMerchantWebhook(
      merchantId,
      payload.event,
      payload.data,
    );
  }
}
