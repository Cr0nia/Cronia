import { Module } from '@nestjs/common';
import { StatementsController } from './statements.controller';
import { StatementsService } from './statements.service';
import { BlockchainModule } from '../solana/blockchain.module';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [BlockchainModule],
  controllers: [StatementsController],
  providers: [StatementsService, PrismaService],
  exports: [StatementsService],
})
export class StatementsModule {}
