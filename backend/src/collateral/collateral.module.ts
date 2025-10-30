import { Module } from '@nestjs/common';
import { CollateralController } from './collateral.controller';
import { CollateralService } from './collateral.service';
import { BlockchainModule } from '../solana/blockchain.module';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [BlockchainModule],
  controllers: [CollateralController],
  providers: [CollateralService, PrismaService],
  exports: [CollateralService],
})
export class CollateralModule {}
