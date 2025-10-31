import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../admin/audit.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Job de fechamento diário de faturas
   * Executa todo dia às 23:59
   */
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async dailyStatementClosure() {
    const startTime = new Date();
    this.logger.log('Starting daily statement closure job...');

    try {
      // Buscar contas de crédito ativas
      const creditAccounts = await this.prisma.creditAccount.findMany({
        where: { status: 'active' },
      });

      let closedStatements = 0;

      for (const account of creditAccounts) {
        // Verificar se é dia de fechamento
        const today = new Date().getDate();
        if (today === account.billingDay) {
          // Buscar receivables do período
          const cycleId = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

          const notes = await this.prisma.receivableNote.findMany({
            where: {
              buyer: account.ownerPubkey,
              status: { in: ['issued', 'pending'] },
            },
          });

          const totalDue = notes.reduce((sum, note) => sum + note.amountUsdc, 0);
          const minPayment = totalDue * 0.15; // 15% do total

          // Criar statement
          const statement = await this.prisma.statement.create({
            data: {
              ownerPubkey: account.ownerPubkey,
              cycleId,
              closeTs: new Date(),
              totalDue,
              minPayment,
            },
          });

          // Adicionar itens à fatura
          for (const note of notes) {
            await this.prisma.statementItem.create({
              data: {
                statementId: statement.id,
                type: 'charge',
                amountUsdc: note.amountUsdc,
                metaJson: {
                  notePda: note.notePda,
                  orderId: note.orderId,
                  dueDate: note.dueTs,
                },
              },
            });
          }

          closedStatements++;
          this.logger.log(`Statement closed for ${account.ownerPubkey}: $${totalDue}`);
        }
      }

      // Registrar execução
      await this.prisma.jobsRuns.create({
        data: {
          jobName: 'daily_statement_closure',
          startedAt: startTime,
          finishedAt: new Date(),
          ok: true,
          details: {
            totalAccounts: creditAccounts.length,
            closedStatements,
          },
        },
      });

      this.logger.log(`Daily closure completed: ${closedStatements} statements closed`);
    } catch (error: any) {
      this.logger.error('Daily closure failed:', error);

      await this.prisma.jobsRuns.create({
        data: {
          jobName: 'daily_statement_closure',
          startedAt: startTime,
          finishedAt: new Date(),
          ok: false,
          details: {
            error: error.message,
          },
        },
      });
    }
  }

  /**
   * Job de Dunning (cobrança)
   * Executa todo dia às 10:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async dunningJob() {
    const startTime = new Date();
    this.logger.log('Starting dunning job...');

    try {
      const now = new Date();

      // Buscar receivables vencidas
      const overdueNotes = await this.prisma.receivableNote.findMany({
        where: {
          status: { in: ['issued', 'pending'] },
          dueTs: { lt: now },
        },
        include: {
          sale: {
            include: {
              merchant: true,
            },
          },
        },
      });

      let notificationsCount = 0;

      for (const note of overdueNotes) {
        const daysOverdue = Math.floor(
          (now.getTime() - note.dueTs.getTime()) / (1000 * 60 * 60 * 24),
        );

        this.logger.warn(
          `Overdue note: ${note.notePda}, buyer: ${note.buyer}, days overdue: ${daysOverdue}`,
        );

        // TODO: Enviar notificação/email
        // await this.notificationService.sendOverdueNotice(note.buyer, note, daysOverdue);

        notificationsCount++;

        // Registrar no audit log
        await this.audit.log({
          actorType: 'system',
          action: 'dunning_notice',
          entity: 'ReceivableNote',
          entityId: note.notePda,
          diffJson: {
            daysOverdue,
            amountUsdc: note.amountUsdc,
            dueDate: note.dueTs,
          },
        });
      }

      await this.prisma.jobsRuns.create({
        data: {
          jobName: 'dunning_job',
          startedAt: startTime,
          finishedAt: new Date(),
          ok: true,
          details: {
            totalOverdue: overdueNotes.length,
            notificationsSent: notificationsCount,
          },
        },
      });

      this.logger.log(`Dunning completed: ${notificationsCount} notices sent`);
    } catch (error: any) {
      this.logger.error('Dunning job failed:', error);

      await this.prisma.jobsRuns.create({
        data: {
          jobName: 'dunning_job',
          startedAt: startTime,
          finishedAt: new Date(),
          ok: false,
          details: {
            error: error.message,
          },
        },
      });
    }
  }

  /**
   * Job de monitoramento de Health Factor
   * Executa a cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async healthFactorMonitor() {
    const startTime = new Date();
    this.logger.log('Starting health factor monitor...');

    try {
      // Buscar contas de crédito
      const creditAccounts = await this.prisma.creditAccount.findMany({
        where: { status: 'active' },
      });

      let warningsCount = 0;
      let criticalCount = 0;

      for (const account of creditAccounts) {
        const hf = account.healthFactor;

        // HF < 1.2 = crítico (risco de liquidação)
        if (hf < 1.2) {
          this.logger.error(
            `CRITICAL: Account ${account.ownerPubkey} has HF = ${hf.toFixed(2)}`,
          );

          await this.audit.log({
            actorType: 'system',
            action: 'health_factor_critical',
            entity: 'CreditAccount',
            entityId: account.ownerPubkey,
            diffJson: {
              healthFactor: hf,
              usedUsdc: account.usedUsdc,
              limitUsdc: account.limitUsdc,
              threshold: 1.2,
            },
          });

          criticalCount++;
        }
        // HF < 1.5 = aviso
        else if (hf < 1.5) {
          this.logger.warn(
            `WARNING: Account ${account.ownerPubkey} has HF = ${hf.toFixed(2)}`,
          );

          await this.audit.log({
            actorType: 'system',
            action: 'health_factor_warning',
            entity: 'CreditAccount',
            entityId: account.ownerPubkey,
            diffJson: {
              healthFactor: hf,
              usedUsdc: account.usedUsdc,
              limitUsdc: account.limitUsdc,
              threshold: 1.5,
            },
          });

          warningsCount++;
        }
      }

      await this.prisma.jobsRuns.create({
        data: {
          jobName: 'health_factor_monitor',
          startedAt: startTime,
          finishedAt: new Date(),
          ok: true,
          details: {
            totalAccounts: creditAccounts.length,
            warnings: warningsCount,
            critical: criticalCount,
          },
        },
      });

      this.logger.log(
        `HF monitor completed: ${warningsCount} warnings, ${criticalCount} critical`,
      );
    } catch (error: any) {
      this.logger.error('HF monitor failed:', error);

      await this.prisma.jobsRuns.create({
        data: {
          jobName: 'health_factor_monitor',
          startedAt: startTime,
          finishedAt: new Date(),
          ok: false,
          details: {
            error: error.message,
          },
        },
      });
    }
  }

  /**
   * Executa um job manualmente
   */
  async runJobManually(jobName: string) {
    this.logger.log(`Running job manually: ${jobName}`);

    switch (jobName) {
      case 'daily_statement_closure':
        return await this.dailyStatementClosure();
      case 'dunning_job':
        return await this.dunningJob();
      case 'health_factor_monitor':
        return await this.healthFactorMonitor();
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}
