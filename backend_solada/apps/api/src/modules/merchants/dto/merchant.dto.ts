import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({ example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' })
  @IsString()
  walletAddress: string;

  @ApiProperty({ example: 'My Business Inc.' })
  @IsString()
  businessName: string;

  @ApiProperty({ example: 'contact@business.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: '12.345.678/0001-90' })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiProperty({ required: false, example: '+55 11 98765-4321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false, example: 'https://webhook.business.com/cronia' })
  @IsUrl()
  @IsOptional()
  webhookUrl?: string;
}

export class UpdateMerchantDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  webhookUrl?: string;
}
