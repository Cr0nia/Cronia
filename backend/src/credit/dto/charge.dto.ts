import { IsInt, IsNumber, Min, Max, IsString, Length } from 'class-validator';

export class ChargeDto {
  @IsString() ownerPubkey!: string;
  @IsNumber() @Min(0.01) amountUsdc!: number;
  @IsInt() @Min(1) @Max(24) installments!: number;
  @IsString() @Length(64, 64) orderIdHex!: string;
}
