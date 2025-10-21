import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositCollateralDto {
  @ApiProperty({ example: 'So11111111111111111111111111111111111111112' })
  @IsString()
  tokenMint: string;

  @ApiProperty({ example: 'SPL', enum: ['SPL', 'NFT', 'LP'] })
  @IsEnum(['SPL', 'NFT', 'LP'])
  tokenType: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 150.50, description: 'Collateral value in USD' })
  @IsNumber()
  valueUsd: number;

  @ApiProperty({ example: 0.8, description: 'Loan-to-Value ratio' })
  @IsNumber()
  ltv: number;
}
