import { Module } from '@nestjs/common';
import { SolanaModule } from './solana.module';
import { AnchorService } from './anchor.service';
import { ProgramsService } from './programs.service';

@Module({
  imports: [SolanaModule],
  providers: [AnchorService, ProgramsService],
  exports: [SolanaModule, AnchorService, ProgramsService],
})
export class BlockchainModule {}
