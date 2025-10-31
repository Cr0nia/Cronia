import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { OracleService } from './oracle.service';
import {
  SetPumpClassDto,
  SetPumpTokenDto,
  UpdatePriceDto,
} from './dto/pump.dto';

@Controller('oracle')
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  // ========== POST Endpoints - Pump Class ==========

  /**
   * POST /api/v1/oracle/pump/class
   * Define parâmetros da classe pump (LTV, haircut, etc)
   */
  @Post('pump/class')
  async setPumpClass(@Body() dto: SetPumpClassDto) {
    return this.oracleService.setPumpClass(
      dto.maxLtv,
      dto.haircut,
      dto.minHolding,
    );
  }

  /**
   * POST /api/v1/oracle/pump/token
   * Registra um novo token pump com preço base
   */
  @Post('pump/token')
  async setPumpToken(@Body() dto: SetPumpTokenDto) {
    return this.oracleService.setPumpToken(
      dto.mint,
      dto.basePrice,
      dto.volatilityFactor,
    );
  }

  /**
   * POST /api/v1/oracle/pump/price
   * Atualiza preço de um ativo
   */
  @Post('pump/price')
  async updatePrice(@Body() dto: UpdatePriceDto) {
    return this.oracleService.updatePrice(dto.mint, dto.price);
  }

  // ========== GET Endpoints ==========

  /**
   * GET /api/v1/oracle/pump/class
   * Busca informações on-chain da classe pump
   */
  @Get('pump/class')
  async getPumpClassInfo() {
    return this.oracleService.getPumpClassInfo();
  }

  /**
   * GET /api/v1/oracle/pump/token/:mint
   * Busca informações on-chain de um token pump
   */
  @Get('pump/token/:mint')
  async getPumpTokenInfo(@Param('mint') mint: string) {
    return this.oracleService.getPumpTokenInfo(mint);
  }

  /**
   * GET /api/v1/oracle/price/:mint
   * Busca preço atual de um ativo
   */
  @Get('price/:mint')
  async getPrice(@Param('mint') mint: string) {
    return this.oracleService.getPrice(mint);
  }

  /**
   * GET /api/v1/oracle/assets
   * Lista todos os assets cadastrados
   */
  @Get('assets')
  async getAssets(@Query('type') type?: string) {
    return this.oracleService.getAssets(type);
  }
}
