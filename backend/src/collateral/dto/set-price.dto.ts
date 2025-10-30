import { IsString, IsNotEmpty, Length, IsInt, Min } from 'class-validator';

export class SetPriceDto {
  @IsString()
  @IsNotEmpty()
  @Length(32, 60)
  mint!: string;

  @IsInt()
  @Min(0)
  priceUsdc6!: number;

  @IsInt()
  @Min(0)
  ts!: number;
}
