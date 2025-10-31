import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../database/prisma.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /api/v1/jobs/run/:jobName
   * Executa um job manualmente
   */
  @Post('run/:jobName')
  async runJob(@Param('jobName') jobName: string) {
    await this.jobsService.runJobManually(jobName);
    return {
      message: `Job ${jobName} executed successfully`,
      jobName,
      timestamp: new Date(),
    };
  }

  /**
   * GET /api/v1/jobs/list
   * Lista jobs disponíveis
   */
  @Get('list')
  async listJobs() {
    return {
      jobs: [
        {
          name: 'daily_statement_closure',
          description: 'Fechamento diário de faturas',
          schedule: 'Every day at 11:00 PM',
        },
        {
          name: 'dunning_job',
          description: 'Cobrança de recebíveis vencidos',
          schedule: 'Every day at 10:00 AM',
        },
        {
          name: 'health_factor_monitor',
          description: 'Monitor de Health Factor',
          schedule: 'Every hour',
        },
      ],
    };
  }

  /**
   * GET /api/v1/jobs/runs
   * Lista execuções de jobs
   */
  @Get('runs')
  async getJobRuns(
    @Query('jobName') jobName?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;

    const runs = await this.prisma.jobsRuns.findMany({
      where: jobName ? { jobName } : {},
      orderBy: { startedAt: 'desc' },
      take: limitNum,
    });

    return {
      runs,
      count: runs.length,
    };
  }

  /**
   * GET /api/v1/jobs/runs/:id
   * Detalhes de uma execução específica
   */
  @Get('runs/:id')
  async getJobRun(@Param('id') id: string) {
    const run = await this.prisma.jobsRuns.findUnique({
      where: { id },
    });

    if (!run) {
      return {
        error: 'Job run not found',
      };
    }

    return { run };
  }
}
