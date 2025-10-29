import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateMerchantDto {
  @IsString() name!: string;
  @IsString() email!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() cnpj?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsUrl() callbackUrl?: string;
  @IsOptional() @IsInt() @Min(0) takeRateBps?: number;
  @IsOptional() @IsInt() @Min(1) maxInstallments?: number;
  @IsOptional() @Min(0) minTicket?: number;
}

export class CreateMerchantQrDto {
  @Min(1) amount!: number; 
  @IsString() currency!: string; 
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(1) expiresInSec?: number;
  @IsOptional() @IsInt() @Min(1) maxInstallments?: number;
}
