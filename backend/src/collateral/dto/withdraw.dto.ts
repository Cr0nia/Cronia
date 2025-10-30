import { IsString, IsNotEmpty, Length, IsInt, Min } from 'class-validator';

export class WithdrawDto {
  @IsString()
  @IsNotEmpty()
  @Length(32, 60)
  ownerPubkey!: string;

  @IsString()
  @IsNotEmpty()
  @Length(32, 60)
  mint!: string;

  @IsInt()
  @Min(1)
  amount!: number;
}
