import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SolanaService } from '../solana/solana.service';
import { AuditService } from './audit.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  // Configuração padrão de crédito
  private readonly defaultCreditConfig = {
    minScore: 600,
    maxLtvGlobal: 8000, // 80% em BPS
    defaultLimit: 1000, // $1000 USDC
    interestRateMonthly: 200, // 2% ao mês em BPS
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly solana: SolanaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Carrega configuração de crédito do banco ou retorna padrão
   */
  private async loadCreditConfig() {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: 'credit_config' },
    });

    if (!config) {
      return this.defaultCreditConfig;
    }

    return config.value as any;
  }

  /**
   * Atualiza configurações de políticas de crédito
   */
  async updateCreditConfig(config: {
    minScore?: number;
    maxLtvGlobal?: number;
    defaultLimit?: number;
    interestRateMonthly?: number;
  }) {
    // Carrega configuração atual
    const currentConfig = await this.loadCreditConfig();

    // Atualiza apenas os campos fornecidos
    const updatedConfig = {
      ...currentConfig,
      ...(config.minScore !== undefined && { minScore: config.minScore }),
      ...(config.maxLtvGlobal !== undefined && { maxLtvGlobal: config.maxLtvGlobal }),
      ...(config.defaultLimit !== undefined && { defaultLimit: config.defaultLimit }),
      ...(config.interestRateMonthly !== undefined && { interestRateMonthly: config.interestRateMonthly }),
    };

    // Salva no banco de dados
    await this.prisma.systemConfig.upsert({
      where: { key: 'credit_config' },
      create: {
        key: 'credit_config',
        value: updatedConfig,
      },
      update: {
        value: updatedConfig,
      },
    });

    this.logger.log('Credit config updated:', updatedConfig);

    // Registrar mudança no audit log
    await this.audit.log({
      actorType: 'admin',
      actorId: 'system', // TODO: pegar do contexto de autenticação
      action: 'update',
      entity: 'SystemConfig',
      entityId: 'credit_config',
      diffJson: {
        before: currentConfig,
        after: updatedConfig,
        changes: config,
      },
    });

    return {
      config: updatedConfig,
      message: 'Credit configuration updated successfully',
    };
  }

  /**
   * Retorna configurações atuais de crédito
   */
  async getCreditConfig() {
    const config = await this.loadCreditConfig();
    return {
      config,
    };
  }

  /**
   * Reprocessa eventos blockchain de um range de slots
   */
  async reindexEvents(options: {
    fromSlot?: number;
    toSlot?: number;
    program?: string;
    force?: boolean;
  }) {
    const {
      fromSlot = 0,
      toSlot,
      program,
      force = false,
    } = options;

    this.logger.log(`Starting reindex: fromSlot=${fromSlot}, toSlot=${toSlot}, program=${program}, force=${force}`);

    // Buscar eventos não processados ou reprocessar todos se force=true
    const events = await this.prisma.onchainEvent.findMany({
      where: {
        slot: {
          gte: fromSlot,
          ...(toSlot ? { lte: toSlot } : {}),
        },
        ...(program ? { program } : {}),
      },
      orderBy: { slot: 'asc' },
    });

    this.logger.log(`Found ${events.length} events to reindex`);

    // Simular reprocessamento
    // Em produção, chamar handlers específicos para cada tipo de evento
    const processed: any[] = [];
    const failed: any[] = [];

    for (const event of events) {
      try {
        // TODO: Chamar handler apropriado baseado em event.event
        // Ex: handleChargeAuthorized(event.payload)
        //     handleNoteIssued(event.payload)
        //     etc.

        processed.push({
          slot: event.slot,
          sig: event.sig,
          event: event.event,
        });
      } catch (error: any) {
        failed.push({
          slot: event.slot,
          sig: event.sig,
          error: error.message,
        });
      }
    }

    // Salvar log da execução
    await this.prisma.jobsRuns.create({
      data: {
        jobName: 'reindex_events',
        startedAt: new Date(),
        finishedAt: new Date(),
        ok: failed.length === 0,
        details: {
          fromSlot,
          toSlot,
          program,
          processed: processed.length,
          failed: failed.length,
        },
      },
    });

    this.logger.log(`Reindex completed: ${processed.length} processed, ${failed.length} failed`);

    return {
      fromSlot,
      toSlot,
      program,
      total: events.length,
      processed: processed.length,
      failed: failed.length,
      failures: failed,
      message: 'Reindex completed',
    };
  }

  /**
   * Lista últimas execuções de jobs
   */
  async getJobRuns(jobName?: string, limit = 20) {
    const runs = await this.prisma.jobsRuns.findMany({
      where: jobName ? { jobName } : {},
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return {
      runs,
      count: runs.length,
    };
  }

  /**
   * Limpa cache de eventos/dados (útil para desenvolvimento)
   */
  async clearCache(type: 'events' | 'prices' | 'all') {
    let deleted = 0;

    if (type === 'events' || type === 'all') {
      const result = await this.prisma.onchainEvent.deleteMany({});
      deleted += result.count;
      this.logger.log(`Deleted ${result.count} onchain events`);
    }

    if (type === 'prices' || type === 'all') {
      const result = await this.prisma.price.deleteMany({});
      deleted += result.count;
      this.logger.log(`Deleted ${result.count} prices`);
    }

    return {
      type,
      deleted,
      message: `Cache cleared: ${deleted} records deleted`,
    };
  }

  /**
   * Estatísticas gerais do sistema
   */
  async getSystemStats() {
    const [
      totalUsers,
      totalMerchants,
      totalCreditAccounts,
      totalNotes,
      totalAdvances,
      onchainEvents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.merchant.count(),
      this.prisma.creditAccount.count(),
      this.prisma.receivableNote.count(),
      this.prisma.poolAdvance.count(),
      this.prisma.onchainEvent.count(),
    ]);

    return {
      users: totalUsers,
      merchants: totalMerchants,
      creditAccounts: totalCreditAccounts,
      receivableNotes: totalNotes,
      poolAdvances: totalAdvances,
      onchainEvents,
      timestamp: new Date(),
    };
  }
}
