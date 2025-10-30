import { IsNumber, Min, IsString } from 'class-validator';
export class SetLimitDto {
  @IsString() ownerPubkey!: string;
  @IsNumber() @Min(0) newLimitUsdc!: number;
}
