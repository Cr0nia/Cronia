import { IsNumber, Min, IsString } from 'class-validator';
export class RepayDto {
  @IsString() ownerPubkey!: string;
  @IsNumber() @Min(0.01) amountUsdc!: number;
}
