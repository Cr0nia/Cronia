import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto';
import { AdminApiGuard } from '../common/guards/admin-api.guard';

@Controller('merchants')
export class MerchantsController {
  constructor(private service: MerchantsService) {}

  // Admin cria merchant e recebe a API key (mostrar apenas uma vez)
  @UseGuards(AdminApiGuard)
  @Post()
  async create(@Body() dto: CreateMerchantDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
