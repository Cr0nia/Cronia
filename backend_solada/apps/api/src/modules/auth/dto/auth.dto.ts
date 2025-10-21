import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChallengeDto {
  @ApiProperty({ example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' })
  @IsString()
  walletAddress: string;
}

export class VerifyDto {
  @ApiProperty({ example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    example: 'localhost wants you to sign in with your Solana account...',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: '3yZe7d7cXKBx7...',
    description: 'Base58-encoded signature',
  })
  @IsString()
  signature: string;

  @ApiProperty({ enum: ['consumer', 'merchant'], default: 'consumer' })
  @IsEnum(['consumer', 'merchant'])
  @IsOptional()
  userType?: 'consumer' | 'merchant' = 'consumer';
}
