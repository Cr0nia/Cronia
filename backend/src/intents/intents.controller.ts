import { Body, Controller, Param, Post, Req, UseGuards, Get } from '@nestjs/common';
import { IntentsService } from './intents.service';
import { CreateIntentDto, ConfirmIntentDto } from './dto';
import { MerchantApiGuard } from '../common/guards/merchant-api.guard';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller()
export class IntentsController {
  constructor(private service: IntentsService) {}

  @UseGuards(MerchantApiGuard)
  @Post('merchants/:merchantId/qrs')
  async createQr(@Param('merchantId') merchantId: string, @Body() dto: any, @Req() req: any) {
    if (req.merchant?.id && req.merchant.id !== merchantId) {

    }
    return this.service.createByMerchant(merchantId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('intents/:id')
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('intents/:id/confirm')
  async confirm(@Param('id') id: string, @Body() dto: any) {
    return this.service.confirmIntent(id, dto.ownerPubkey, dto.orderIdExt);
  }

  @UseGuards(MerchantApiGuard)
  @Post('merchants/:merchantId/intents/:id/cancel')
  async cancel(@Param('merchantId') merchantId: string, @Param('id') id: string, @Req() req: any) {
    return this.service.cancelByMerchant(id, merchantId);
  }
}
