import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { HeliusWebhookDto, MerchantWebhookDto } from './dto/webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * POST /api/v1/webhooks/solana
   * Recebe eventos do Helius
   */
  @Post('solana')
  async receiveHeliusWebhook(@Body() dto: HeliusWebhookDto) {
    return this.webhooksService.processHeliusWebhook(dto);
  }

  /**
   * POST /api/v1/webhooks/merchant
   * Envia webhook para lojista (uso interno/admin)
   */
  @Post('merchant')
  async sendMerchantWebhook(@Body() dto: MerchantWebhookDto) {
    return this.webhooksService.sendMerchantWebhook(
      dto.merchantId,
      dto.event,
      dto.data,
    );
  }

  /**
   * GET /api/v1/webhooks/list
   * Lista webhooks enviados
   */
  @Get('list')
  async listWebhooks(
    @Query('target') target?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.webhooksService.getWebhooks(target, limitNum);
  }

  /**
   * POST /api/v1/webhooks/retry/:id
   * Tentar reenviar webhook falhado
   */
  @Post('retry/:id')
  async retryWebhook(@Param('id') id: string) {
    return this.webhooksService.retryWebhook(id);
  }
}
