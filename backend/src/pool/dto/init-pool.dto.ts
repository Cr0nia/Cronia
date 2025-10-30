import { IsString, IsNumber } from 'class-validator';

export class InitPoolDto {
  @IsString()
  adminPubkey: string; // Admin que vai assinar (para prepare)
}

export class ReplenishReserveDto {
  @IsString()
  adminPubkey: string;

  @IsNumber()
  amount: number; // Quantidade em USDC
}
