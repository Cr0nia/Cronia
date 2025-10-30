import { IsString, IsNotEmpty, Length } from 'class-validator';

export class OpenAccountDto {
  @IsString()
  @IsNotEmpty()
  @Length(32, 60)
  ownerPubkey!: string;
}
