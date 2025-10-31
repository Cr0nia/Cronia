import { Module } from '@nestjs/common';
import { OracleController } from './oracle.controller';
import { OracleService } from './oracle.service';
import { BlockchainModule } from '../solana/blockchain.module';
import { DatabaseModule } from '../database/prisma.module';

@Module({
  imports: [BlockchainModule, DatabaseModule],
  controllers: [OracleController],
  providers: [OracleService],
  exports: [OracleService],
})
export class OracleModule {}
