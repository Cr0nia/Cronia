import { Module } from '@nestjs/common';
import { ReceivablesController } from './receivables.controller';
import { ReceivablesService } from './receivables.service';
import { BlockchainModule } from '../solana/blockchain.module';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [BlockchainModule],
  controllers: [ReceivablesController],
  providers: [ReceivablesService, PrismaService],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
