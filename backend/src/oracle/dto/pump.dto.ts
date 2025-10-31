import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SetPumpClassDto {
  @IsNumber()
  maxLtv: number; // LTV máximo em BPS (ex: 5000 = 50%)

  @IsNumber()
  haircut: number; // Haircut em BPS (ex: 2000 = 20%)

  @IsNumber()
  @IsOptional()
  minHolding?: number; // Tempo mínimo de holding em segundos
}

export class SetPumpTokenDto {
  @IsString()
  mint: string; // Address do token pump

  @IsNumber()
  basePrice: number; // Preço base em USDC (6 decimals)

  @IsNumber()
  @IsOptional()
  volatilityFactor?: number; // Fator de volatilidade (BPS)
}

export class UpdatePriceDto {
  @IsString()
  mint: string; // Address do ativo

  @IsNumber()
  price: number; // Novo preço em USDC (valor float, será convertido)
}
