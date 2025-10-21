import { Module } from '@nestjs/common';
import { CollateralController } from './collateral.controller';
import { CollateralService } from './collateral.service';

@Module({
  controllers: [CollateralController],
  providers: [CollateralService],
  exports: [CollateralService],
})
export class CollateralModule {}
