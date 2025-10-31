import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gera relatório de vendas em CSV
   */
  async generateSalesReport(
    merchantId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<string> {
    const where: any = {};

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        merchant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Gerar CSV
    const headers = [
      'ID',
      'Merchant',
      'Client',
      'Total (USDC)',
      'Installments',
      'Status',
      'TxSig',
      'Date',
    ];

    const rows = sales.map((sale) => [
      sale.id,
      sale.merchant.name,
      sale.clientPubkey.substring(0, 8) + '...',
      sale.totalUsdc.toFixed(2),
      sale.installments,
      sale.status,
      sale.txSig || '-',
      sale.createdAt.toISOString(),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Gera relatório de recebíveis em CSV
   */
  async generateReceivablesReport(
    merchantId?: string,
    status?: string,
  ): Promise<string> {
    const where: any = {};

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (status) {
      where.status = status;
    }

    const notes = await this.prisma.receivableNote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Note PDA',
      'Buyer',
      'Merchant ID',
      'Amount (USDC)',
      'Due Date',
      'Status',
      'Order ID',
      'Created At',
    ];

    const rows = notes.map((note) => [
      note.notePda.substring(0, 12) + '...',
      note.buyer.substring(0, 8) + '...',
      note.merchantId,
      note.amountUsdc.toFixed(2),
      note.dueTs.toISOString().split('T')[0],
      note.status,
      note.orderId,
      note.createdAt.toISOString(),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Gera relatório de antecipações em CSV
   */
  async generateAdvancesReport(merchantId?: string): Promise<string> {
    const where: any = {};

    // Se merchantId fornecido, filtrar por merchant
    if (merchantId) {
      // Buscar notas do merchant
      const notes = await this.prisma.receivableNote.findMany({
        where: { merchantId },
        select: { notePda: true },
      });

      where.notePda = {
        in: notes.map((n) => n.notePda),
      };
    }

    const advances = await this.prisma.poolAdvance.findMany({
      where,
      include: {
        note: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'ID',
      'Note PDA',
      'Gross (USDC)',
      'Discount (USDC)',
      'Net (USDC)',
      'Status',
      'TxSig',
      'Date',
    ];

    const rows = advances.map((adv) => [
      adv.id,
      adv.notePda.substring(0, 12) + '...',
      adv.grossUsdc?.toFixed(2) || '0.00',
      adv.discountUsdc?.toFixed(2) || '0.00',
      adv.netUsdc?.toFixed(2) || '0.00',
      adv.status,
      adv.txSignature?.substring(0, 12) + '...' || '-',
      adv.createdAt.toISOString(),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Métricas gerais de um merchant
   */
  async getMerchantMetrics(merchantId: string) {
    const [sales, receivables, advances] = await Promise.all([
      this.prisma.sale.findMany({
        where: { merchantId },
      }),
      this.prisma.receivableNote.findMany({
        where: { merchantId },
      }),
      this.prisma.poolAdvance.findMany({
        where: {
          note: {
            merchantId,
          },
        },
      }),
    ]);

    const totalSales = sales.reduce((sum, s) => sum + s.totalUsdc, 0);
    const totalReceivables = receivables.reduce((sum, r) => sum + r.amountUsdc, 0);
    const totalAdvanced = advances.reduce((sum, a) => sum + (a.netUsdc || 0), 0);

    const salesByStatus = sales.reduce((acc: any, sale) => {
      acc[sale.status] = (acc[sale.status] || 0) + 1;
      return acc;
    }, {});

    const receivablesByStatus = receivables.reduce((acc: any, rec) => {
      acc[rec.status] = (acc[rec.status] || 0) + 1;
      return acc;
    }, {});

    return {
      merchantId,
      summary: {
        totalSales: sales.length,
        totalSalesVolume: totalSales,
        totalReceivables: receivables.length,
        totalReceivablesVolume: totalReceivables,
        totalAdvances: advances.length,
        totalAdvancedVolume: totalAdvanced,
      },
      salesByStatus,
      receivablesByStatus,
      averageTicket: sales.length > 0 ? totalSales / sales.length : 0,
      advanceRate: totalReceivables > 0 ? (totalAdvanced / totalReceivables) * 100 : 0,
    };
  }

  /**
   * Métricas globais do sistema
   */
  async getGlobalMetrics() {
    const [users, merchants, sales, receivables, advances, creditAccounts] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.merchant.count(),
        this.prisma.sale.findMany(),
        this.prisma.receivableNote.findMany(),
        this.prisma.poolAdvance.findMany(),
        this.prisma.creditAccount.findMany(),
      ]);

    const totalSalesVolume = sales.reduce((sum, s) => sum + s.totalUsdc, 0);
    const totalReceivablesVolume = receivables.reduce((sum, r) => sum + r.amountUsdc, 0);
    const totalAdvancedVolume = advances.reduce((sum, a) => sum + (a.netUsdc || 0), 0);
    const totalCreditUsed = creditAccounts.reduce((sum, c) => sum + c.usedUsdc, 0);
    const totalCreditLimit = creditAccounts.reduce((sum, c) => sum + c.limitUsdc, 0);

    return {
      users,
      merchants,
      sales: {
        count: sales.length,
        volume: totalSalesVolume,
      },
      receivables: {
        count: receivables.length,
        volume: totalReceivablesVolume,
      },
      advances: {
        count: advances.length,
        volume: totalAdvancedVolume,
      },
      credit: {
        accounts: creditAccounts.length,
        totalUsed: totalCreditUsed,
        totalLimit: totalCreditLimit,
        utilizationRate: totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Dados para gráfico de vendas ao longo do tempo
   */
  async getSalesChart(merchantId?: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (merchantId) {
      where.merchantId = merchantId;
    }

    const sales = await this.prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // Agrupar por dia
    const chartData: any = {};

    sales.forEach((sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!chartData[date]) {
        chartData[date] = {
          date,
          count: 0,
          volume: 0,
        };
      }
      chartData[date].count++;
      chartData[date].volume += sale.totalUsdc;
    });

    return Object.values(chartData);
  }

  /**
   * Converte array 2D para CSV
   */
  private arrayToCSV(data: any[][]): string {
    return data
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');
  }
}
