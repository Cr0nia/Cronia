import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import { MintNoteDto } from './dto/mint-note.dto';

@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly svc: ReceivablesService) {}

  /**
   * Emite uma nota (admin - backend assina)
   */
  @Post('mint')
  mintNote(@Body() dto: MintNoteDto) {
    return this.svc.mintNote(
      dto.orderId,
      dto.index,
      dto.buyer,
      dto.merchant,
      dto.amountUsdc,
      dto.dueTs,
    );
  }

  /**
   * Prepara transação para emitir nota (usuário assina)
   */
  @Post('prepare/mint')
  prepareMintNote(
    @Body()
    dto: MintNoteDto & { payerPubkey: string },
  ) {
    return this.svc.prepareMintNote(
      dto.payerPubkey,
      dto.orderId,
      dto.index,
      dto.buyer,
      dto.merchant,
      dto.amountUsdc,
      dto.dueTs,
    );
  }

  /**
   * Emite múltiplas notas para um parcelamento
   */
  @Post('mint-for-charge')
  mintNotesForCharge(
    @Body()
    dto: {
      buyer: string;
      merchant: string;
      totalAmount: number;
      installments: number;
      orderId: string;
    },
  ) {
    return this.svc.mintNotesForCharge(
      dto.buyer,
      dto.merchant,
      dto.totalAmount,
      dto.installments,
      dto.orderId,
    );
  }

  /**
   * Busca uma nota específica
   */
  @Get('note/:orderId/:index')
  getNote(@Param('orderId') orderId: string, @Param('index') index: string) {
    return this.svc.getNote(orderId, parseInt(index));
  }

  /**
   * Lista notas por comprador
   */
  @Get('buyer/:buyer')
  getNotesByBuyer(@Param('buyer') buyer: string) {
    return this.svc.getNotesByBuyer(buyer);
  }

  /**
   * Lista notas por merchant
   */
  @Get('merchant/:merchantId')
  getNotesByMerchant(@Param('merchantId') merchantId: string) {
    return this.svc.getNotesByMerchant(merchantId);
  }

  /**
   * Lista notas por status
   */
  @Get('status/:status')
  getNotesByStatus(@Param('status') status: string) {
    return this.svc.getNotesByStatus(status);
  }
}
