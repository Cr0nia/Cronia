import { IsString, IsNotEmpty, Length } from 'class-validator';

export class OpenPositionDto {
  @IsString()
  @IsNotEmpty()
  @Length(32, 60)
  ownerPubkey!: string;

  @IsString()
  @IsNotEmpty()
  @Length(32, 60)
  mint!: string;
}
