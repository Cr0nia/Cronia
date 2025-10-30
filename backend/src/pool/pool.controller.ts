import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PoolService } from './pool.service';
import { InitPoolDto, ReplenishReserveDto } from './dto/init-pool.dto';
import { AdvanceNoteDto, GuaranteeSettleDto } from './dto/advance.dto';

@Controller('pool')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  // ========== GET Endpoints ==========

  /**
   * GET /api/v1/pool/:adminPubkey
   * Busca informações do pool
   */
  @Get(':adminPubkey')
  async getPoolInfo(@Param('adminPubkey') adminPubkey: string) {
    return this.poolService.getPoolInfo(adminPubkey);
  }

  /**
   * GET /api/v1/pool/advances/history
   * Lista histórico de antecipações
   */
  @Get('advances/history')
  async getAdvanceHistory(@Query('poolPda') poolPda?: string) {
    return this.poolService.getAdvanceHistory(poolPda);
  }

  /**
   * GET /api/v1/pool/advances/note/:notePda
   * Busca antecipação por nota
   */
  @Get('advances/note/:notePda')
  async getAdvanceByNote(@Param('notePda') notePda: string) {
    return this.poolService.getAdvanceByNote(notePda);
  }

  // ========== POST Endpoints - Admin (Backend assina) ==========

  /**
   * POST /api/v1/pool/init
   * Inicializa pool de liquidez (backend assina)
   */
  @Post('init')
  async initPool() {
    return this.poolService.initPool();
  }

  /**
   * POST /api/v1/pool/replenish
   * Reabastece reserva do pool (backend assina)
   */
  @Post('replenish')
  async replenishReserve(@Body() dto: ReplenishReserveDto) {
    return this.poolService.replenishReserve(dto.amount);
  }

  /**
   * POST /api/v1/pool/advance
   * Antecipa nota (backend assina)
   */
  @Post('advance')
  async advanceNote(@Body() dto: AdvanceNoteDto) {
    return this.poolService.advanceNote(dto.notePda);
  }

  /**
   * POST /api/v1/pool/guarantee-settle
   * Liquida garantia (backend assina)
   */
  @Post('guarantee-settle')
  async guaranteeSettle(@Body() dto: GuaranteeSettleDto) {
    return this.poolService.guaranteeSettle(dto.notePda);
  }

  // ========== POST Endpoints - Prepare (Usuário assina) ==========

  /**
   * POST /api/v1/pool/prepare/init
   * Prepara transação para inicializar pool
   */
  @Post('prepare/init')
  async prepareInitPool(@Body() dto: InitPoolDto) {
    return this.poolService.prepareInitPool(dto.adminPubkey);
  }

  /**
   * POST /api/v1/pool/prepare/replenish
   * Prepara transação para reabastecer reserva
   */
  @Post('prepare/replenish')
  async prepareReplenishReserve(@Body() dto: ReplenishReserveDto) {
    return this.poolService.prepareReplenishReserve(
      dto.adminPubkey,
      dto.amount,
    );
  }

  /**
   * POST /api/v1/pool/prepare/advance
   * Prepara transação para antecipar nota
   */
  @Post('prepare/advance')
  async prepareAdvanceNote(@Body() dto: AdvanceNoteDto) {
    return this.poolService.prepareAdvanceNote(dto.adminPubkey, dto.notePda);
  }

  /**
   * POST /api/v1/pool/prepare/guarantee-settle
   * Prepara transação para liquidar garantia
   */
  @Post('prepare/guarantee-settle')
  async prepareGuaranteeSettle(@Body() dto: GuaranteeSettleDto) {
    return this.poolService.prepareGuaranteeSettle(
      dto.adminPubkey,
      dto.notePda,
    );
  }
}
