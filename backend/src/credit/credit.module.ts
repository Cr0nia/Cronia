import { Module } from '@nestjs/common';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { BlockchainModule } from '../solana/blockchain.module';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [BlockchainModule],
  controllers: [CreditController],
  providers: [CreditService, PrismaService],
  exports: [CreditService],
})
export class CreditModule {}
