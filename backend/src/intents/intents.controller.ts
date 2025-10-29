import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IntentsService } from './intents.service';
import { CreateIntentDto, ConfirmIntentDto } from './dto';
import { MerchantApiGuard } from '../common/guards/merchant-api.guard';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller()
export class IntentsController {
  constructor(private service: IntentsService) {}

  // Merchant cria o QR (passa merchantId na rota)
  @UseGuards(MerchantApiGuard)
  @Post('merchants/:merchantId/qrs')
  async createQr(@Param('merchantId') merchantId: string, @Body() dto: Omit<CreateIntentDto, 'merchantId'>, @Req() req: any) {
    if (req.merchant?.id && req.merchant.id !== merchantId) {
    }
    const res = await this.service.createByMerchant(merchantId, dto);
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Post('intents/:id/confirm')
  async confirm(@Param('id') id: string, @Body() dto: Omit<ConfirmIntentDto, 'intentId'>, @Req() req: any) {
    return this.service.confirmIntent(id, dto.ownerPubkey, dto.orderIdExt);
  }
}
