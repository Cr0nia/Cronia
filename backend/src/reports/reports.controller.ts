import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /api/v1/reports/sales/csv
   * Exporta relatório de vendas em CSV
   */
  @Get('sales/csv')
  async exportSalesCSV(
    @Query('merchantId') merchantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const csv = await this.reportsService.generateSalesReport(
      merchantId,
      start,
      end,
    );

    if (!res) {
      throw new Error('Response object not available');
    }

    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      `attachment; filename=sales-report-${Date.now()}.csv`,
    );
    return res.status(HttpStatus.OK).send(csv);
  }

  /**
   * GET /api/v1/reports/receivables/csv
   * Exporta relatório de recebíveis em CSV
   */
  @Get('receivables/csv')
  async exportReceivablesCSV(
    @Query('merchantId') merchantId?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.reportsService.generateReceivablesReport(
      merchantId,
      status,
    );

    if (!res) {
      throw new Error('Response object not available');
    }

    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      `attachment; filename=receivables-report-${Date.now()}.csv`,
    );
    return res.status(HttpStatus.OK).send(csv);
  }

  /**
   * GET /api/v1/reports/advances/csv
   * Exporta relatório de antecipações em CSV
   */
  @Get('advances/csv')
  async exportAdvancesCSV(
    @Query('merchantId') merchantId?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.reportsService.generateAdvancesReport(merchantId);

    if (!res) {
      throw new Error('Response object not available');
    }

    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      `attachment; filename=advances-report-${Date.now()}.csv`,
    );
    return res.status(HttpStatus.OK).send(csv);
  }

  /**
   * GET /api/v1/reports/merchant/:id/metrics
   * Métricas de um merchant específico
   */
  @Get('merchant/:id/metrics')
  async getMerchantMetrics(@Query('id') merchantId: string) {
    return this.reportsService.getMerchantMetrics(merchantId);
  }

  /**
   * GET /api/v1/reports/global/metrics
   * Métricas globais do sistema
   */
  @Get('global/metrics')
  async getGlobalMetrics() {
    return this.reportsService.getGlobalMetrics();
  }

  /**
   * GET /api/v1/reports/sales/chart
   * Dados para gráfico de vendas
   */
  @Get('sales/chart')
  async getSalesChart(
    @Query('merchantId') merchantId?: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.reportsService.getSalesChart(merchantId, daysNum);
  }
}
