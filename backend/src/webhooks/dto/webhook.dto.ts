import { IsString, IsObject, IsOptional } from 'class-validator';

export class HeliusWebhookDto {
  @IsString()
  type: string;

  @IsObject()
  @IsOptional()
  transaction?: any;

  @IsObject()
  @IsOptional()
  events?: any;
}

export class MerchantWebhookDto {
  @IsString()
  merchantId: string;

  @IsString()
  event: string;

  @IsObject()
  data: any;
}
