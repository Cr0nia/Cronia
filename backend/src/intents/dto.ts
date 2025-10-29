import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateIntentDto {
  @IsUUID() merchantId!: string;
  @IsInt() @Min(1) amountUsdc!: number; 
  @IsString() currency!: string;        
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(1) maxInstallments?: number;
  @IsOptional() @IsInt() @Min(1) expiresInSec?: number;
}

export class ConfirmIntentDto {
  @IsString() intentId!: string;
  @IsOptional() @IsString() ownerPubkey?: string; 
  @IsOptional() @IsString() orderIdExt?: string;
}
