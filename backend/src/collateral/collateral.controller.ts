import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CollateralService } from './collateral.service';
import { OpenPositionDto } from './dto/open-position.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { SetPriceDto } from './dto/set-price.dto';

@Controller()
export class CollateralController {
  constructor(private readonly svc: CollateralService) {}

  @Post('collateral/open-position')
  open(@Body() dto: OpenPositionDto) {
    return this.svc.openPosition(dto.ownerPubkey, dto.mint);
  }

  @Post('collateral/deposit')
  deposit(@Body() dto: DepositDto) {
    return this.svc.deposit(dto.ownerPubkey, dto.mint, dto.amount);
  }

  @Post('collateral/withdraw')
  withdraw(@Body() dto: WithdrawDto) {
    return this.svc.withdraw(dto.ownerPubkey, dto.mint, dto.amount);
  }

  @Post('oracle/pump/price')
  setPrice(@Body() dto: SetPriceDto) {
    return this.svc.setPrice(dto.mint, dto.priceUsdc6, dto.ts);
  }

  @Post('collateral/init/vault-config')
  initCfg() {
    return this.svc.initVaultConfig();
  }

  @Post('collateral/init/vault')
  initVault(@Body() dto: { mint: string }) {
    return this.svc.initVaultForMint(dto.mint);
  }

  @Post('oracle/pump/class/init')
  pumpClass() {
    return this.svc.setPumpClassParams();
  }

  @Post('oracle/pump/token')
  pumpToken(@Body() dto: { mint: string }) {
    return this.svc.setPumpTokenParams(dto.mint);
  }

  @Post('collateral/deposit/admin')
  depositAdmin(@Body() dto: { mint: string; amount: number }) {
    return this.svc.depositAsAdmin(dto.mint, dto.amount);
  }

  @Get('collateral/:owner')
  getPositions(@Param('owner') owner: string) {
    return this.svc.getPositions(owner);
  }

  @Get('collateral/:owner/:mint')
  getPosition(@Param('owner') owner: string, @Param('mint') mint: string) {
    return this.svc.getPosition(owner, mint);
  }

  // ==================== NOVOS ENDPOINTS PARA TRANSAÇÕES NÃO ASSINADAS ====================

  @Post('collateral/prepare/open-position')
  prepareOpenPosition(@Body() dto: OpenPositionDto) {
    return this.svc.prepareOpenPosition(dto.ownerPubkey, dto.mint);
  }

  @Post('collateral/prepare/deposit')
  prepareDeposit(@Body() dto: DepositDto) {
    return this.svc.prepareDeposit(dto.ownerPubkey, dto.mint, dto.amount);
  }

  @Post('collateral/prepare/withdraw')
  prepareWithdraw(@Body() dto: WithdrawDto) {
    return this.svc.prepareWithdraw(dto.ownerPubkey, dto.mint, dto.amount);
  }
}
