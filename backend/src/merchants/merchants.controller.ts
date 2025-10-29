import { Body, Controller, Get, Header, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto';
import { AdminApiGuard } from '../common/guards/admin-api.guard';
import { MerchantApiGuard } from '../common/guards/merchant-api.guard';
import type { Response } from 'express';

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

  @UseGuards(AdminApiGuard)
  @Post(':id/rotate-key')
  async rotate(@Param('id') id: string) {
    return this.service.rotateKey(id);
  }

  @UseGuards(MerchantApiGuard)
  @Get(':id/sales')
  async sales(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    return this.service.listSales(id, { status, from: f, to: t });
  }

  @UseGuards(MerchantApiGuard)
  @Get(':id/metrics')
  async metrics(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    return this.service.metrics(id, { from: f, to: t });
  }

  @UseGuards(MerchantApiGuard)
  @Get(':id/reports')
  @Header('Content-Type', 'text/csv')
  async reportCsv(
    @Param('id') id: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Res() res: Response,
  ) {
    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    const csv = await this.service.reportCsv(id, { from: f, to: t });
    res.setHeader('Content-Disposition', `attachment; filename="sales_${id}.csv"`);
    return res.send(csv);
  }

  @UseGuards(MerchantApiGuard)
  @Post(':id/advance')
  async advance(@Param('id') id: string, @Body() body: { minNetUsdc?: number }) {
    return this.service.requestAdvanceStub(id, body ?? {});
  }
}
