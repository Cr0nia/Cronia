import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditService } from './audit.service';
import { CreditConfigDto, ReindexDto } from './dto/config.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService,
  ) {}

  // ========== POST Endpoints ==========

  /**
   * POST /api/v1/admin/credit/config
   * Atualiza configurações de políticas de crédito
   */
  @Post('credit/config')
  async updateCreditConfig(@Body() dto: CreditConfigDto) {
    return this.adminService.updateCreditConfig(dto);
  }

  /**
   * POST /api/v1/admin/reindex
   * Reprocessa eventos blockchain de um range de slots
   */
  @Post('reindex')
  async reindexEvents(@Body() dto: ReindexDto) {
    return this.adminService.reindexEvents(dto);
  }

  /**
   * POST /api/v1/admin/cache/clear
   * Limpa cache de eventos/dados
   */
  @Post('cache/clear')
  async clearCache(@Body('type') type: 'events' | 'prices' | 'all' = 'all') {
    return this.adminService.clearCache(type);
  }

  // ========== GET Endpoints ==========

  /**
   * GET /api/v1/admin/credit/config
   * Retorna configurações atuais de crédito
   */
  @Get('credit/config')
  async getCreditConfig() {
    return this.adminService.getCreditConfig();
  }

  /**
   * GET /api/v1/admin/jobs/runs
   * Lista últimas execuções de jobs
   */
  @Get('jobs/runs')
  async getJobRuns(
    @Query('jobName') jobName?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getJobRuns(jobName, limitNum);
  }

  /**
   * GET /api/v1/admin/stats
   * Estatísticas gerais do sistema
   */
  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  /**
   * GET /api/v1/admin/audit/entity/:entity/:entityId
   * Busca logs de auditoria por entidade
   */
  @Get('audit/entity/:entity/:entityId')
  async getAuditByEntity(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const logs = await this.auditService.getByEntity(entity, entityId, limitNum);
    return {
      entity,
      entityId,
      logs,
      count: logs.length,
    };
  }

  /**
   * GET /api/v1/admin/audit/actor/:actorType/:actorId
   * Busca logs de auditoria por ator
   */
  @Get('audit/actor/:actorType/:actorId')
  async getAuditByActor(
    @Param('actorType') actorType: string,
    @Param('actorId') actorId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const logs = await this.auditService.getByActor(actorType, actorId, limitNum);
    return {
      actorType,
      actorId,
      logs,
      count: logs.length,
    };
  }

  /**
   * GET /api/v1/admin/audit/recent
   * Busca logs de auditoria recentes
   */
  @Get('audit/recent')
  async getRecentAudit(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const logs = await this.auditService.getRecent(limitNum);
    return {
      logs,
      count: logs.length,
    };
  }
}
