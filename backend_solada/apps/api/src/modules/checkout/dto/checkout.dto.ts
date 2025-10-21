import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @ApiProperty({ example: 150.00 })
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false, default: 'BRL' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false, example: { orderId: '123', items: [] } })
  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class ApproveSessionDto {
  @ApiProperty({ example: 'uuid-of-consumer' })
  @IsString()
  consumerId: string;
}
