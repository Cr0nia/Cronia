import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CreditService } from './credit.service';
import { OpenAccountDto } from './dto/open-account.dto';
import { SetLimitDto } from './dto/set-limit.dto';
import { ChargeDto } from './dto/charge.dto';
import { RepayDto } from './dto/repay.dto';

@Controller('credit')
export class CreditController {
  constructor(private readonly svc: CreditService) {}

  @Post('open')
  open(@Body() dto: OpenAccountDto) {
    return this.svc.openAccount(dto.ownerPubkey);
  }

  @Post('limit')
  limit(@Body() dto: SetLimitDto) {
    return this.svc.setLimit(dto.ownerPubkey, dto.newLimitUsdc);
  }

  @Post('charge')
  charge(@Body() dto: ChargeDto) {
    return this.svc.charge(dto.ownerPubkey, dto.amountUsdc, dto.installments, dto.orderIdHex);
  }

  @Post('repay')
  repay(@Body() dto: RepayDto) {
    return this.svc.repay(dto.ownerPubkey, dto.amountUsdc);
  }

  @Post('open/admin')
  openAsAdmin() {
    return this.svc.openAccountAsAdmin();
  }

  @Get(':owner')
  getAccount(@Param('owner') owner: string) {
    return this.svc.getAccount(owner);
  }

  // ==================== NOVOS ENDPOINTS PARA TRANSAÇÕES NÃO ASSINADAS ====================

  @Post('prepare/open')
  prepareOpenAccount(@Body() dto: OpenAccountDto) {
    return this.svc.prepareOpenAccount(dto.ownerPubkey);
  }
}
