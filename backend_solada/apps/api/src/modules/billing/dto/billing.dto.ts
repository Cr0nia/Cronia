import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RepaymentDto {
  @ApiProperty({ example: 100.50 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'pix', enum: ['pix', 'crypto', 'card'] })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ required: false, example: '5xJ8...' })
  @IsString()
  @IsOptional()
  txSignature?: string;
}
