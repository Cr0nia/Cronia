import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface AuditEntry {
  actorType: 'user' | 'admin' | 'system' | 'merchant';
  actorId?: string;
  action: string; // create, update, delete, approve, reject, etc
  entity: string; // User, Merchant, CreditAccount, etc
  entityId: string;
  diffJson?: any; // Mudanças realizadas
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra uma ação no log de auditoria
   */
  async log(entry: AuditEntry) {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          actorType: entry.actorType,
          actorId: entry.actorId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          diffJson: entry.diffJson || {},
        },
      });

      this.logger.log(
        `Audit: ${entry.actorType}:${entry.actorId} ${entry.action} ${entry.entity}:${entry.entityId}`,
      );

      return auditLog;
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // Não lançamos o erro para não quebrar o fluxo principal
    }
  }

  /**
   * Busca logs de auditoria por entidade
   */
  async getByEntity(entity: string, entityId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: { ts: 'desc' },
      take: limit,
    });
  }

  /**
   * Busca logs de auditoria por ator
   */
  async getByActor(actorType: string, actorId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        actorType,
        actorId,
      },
      orderBy: { ts: 'desc' },
      take: limit,
    });
  }

  /**
   * Busca logs de auditoria recentes
   */
  async getRecent(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { ts: 'desc' },
      take: limit,
    });
  }
}
