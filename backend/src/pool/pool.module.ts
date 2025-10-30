import { Module } from '@nestjs/common';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { BlockchainModule } from '../solana/blockchain.module';
import { DatabaseModule } from '../database/prisma.module';

@Module({
  imports: [BlockchainModule, DatabaseModule],
  controllers: [PoolController],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}
