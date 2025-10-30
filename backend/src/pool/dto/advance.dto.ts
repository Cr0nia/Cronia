import { IsString, IsNumber } from 'class-validator';

export class AdvanceNoteDto {
  @IsString()
  adminPubkey: string; // Admin que vai assinar (para prepare)

  @IsString()
  notePda: string; // PDA da nota a ser antecipada
}

export class GuaranteeSettleDto {
  @IsString()
  adminPubkey: string;

  @IsString()
  notePda: string; // PDA da nota a ser liquidada
}
