import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditService } from './audit.service';
import { DatabaseModule } from '../database/prisma.module';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [DatabaseModule, SolanaModule],
  controllers: [AdminController],
  providers: [AdminService, AuditService],
  exports: [AdminService, AuditService],
})
export class AdminModule {}
