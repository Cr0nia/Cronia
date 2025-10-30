import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StatementsService } from './statements.service';

@Controller('statements')
export class StatementsController {
  constructor(private readonly svc: StatementsService) {}

  /**
   * Gera statement para um usuário
   */
  @Post('generate')
  generateStatement(
    @Body() dto: { ownerPubkey: string; cycleId: string },
  ) {
    return this.svc.generateStatement(dto.ownerPubkey, dto.cycleId);
  }

  /**
   * Gera statements para todos os usuários ativos
   */
  @Post('generate/all')
  generateStatementsForAll() {
    return this.svc.generateStatementsForAll();
  }

  /**
   * Busca statement por ID
   */
  @Get(':id')
  getStatement(@Param('id') id: string) {
    return this.svc.getStatement(id);
  }

  /**
   * Lista statements de um usuário
   */
  @Get('owner/:ownerPubkey')
  getStatementsByOwner(@Param('ownerPubkey') ownerPubkey: string) {
    return this.svc.getStatementsByOwner(ownerPubkey);
  }

  /**
   * Busca statement mais recente de um usuário
   */
  @Get('owner/:ownerPubkey/latest')
  getLatestStatement(@Param('ownerPubkey') ownerPubkey: string) {
    return this.svc.getLatestStatement(ownerPubkey);
  }

  /**
   * Adiciona item ao statement (juros, taxas, etc)
   */
  @Post(':id/items')
  addStatementItem(
    @Param('id') id: string,
    @Body() dto: { type: string; amountUsdc: number; metaJson: any },
  ) {
    return this.svc.addStatementItem(id, dto.type, dto.amountUsdc, dto.metaJson);
  }
}
