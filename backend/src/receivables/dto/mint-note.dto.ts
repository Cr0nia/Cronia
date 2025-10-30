import { IsString, IsNumber, IsInt, Min, Max } from 'class-validator';

export class MintNoteDto {
  @IsString()
  orderId: string; // hex string (32 bytes = 64 chars)

  @IsInt()
  @Min(0)
  @Max(255)
  index: number; // índice da parcela (0-255)

  @IsString()
  buyer: string; // publickey

  @IsString()
  merchant: string; // publickey

  @IsNumber()
  @Min(0)
  amountUsdc: number; // em micro USDC (6 decimals)

  @IsNumber()
  dueTs: number; // timestamp unix em segundos
}
