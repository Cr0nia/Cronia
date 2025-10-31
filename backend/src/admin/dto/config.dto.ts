import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreditConfigDto {
  @IsNumber()
  @IsOptional()
  minScore?: number; // Score mínimo para crédito

  @IsNumber()
  @IsOptional()
  maxLtvGlobal?: number; // LTV máximo global (BPS)

  @IsNumber()
  @IsOptional()
  defaultLimit?: number; // Limite padrão em USDC

  @IsNumber()
  @IsOptional()
  interestRateMonthly?: number; // Taxa de juros mensal (BPS)
}

export class ReindexDto {
  @IsNumber()
  @IsOptional()
  fromSlot?: number; // Slot inicial para reindexação

  @IsNumber()
  @IsOptional()
  toSlot?: number; // Slot final para reindexação

  @IsString()
  @IsOptional()
  program?: string; // Program específico para reindexar

  @IsBoolean()
  @IsOptional()
  force?: boolean; // Força reindexação mesmo se já processado
}
