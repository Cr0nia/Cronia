import { Module } from '@nestjs/common';
import { SolanaService } from './solana.service';
import { ProgramsService } from './programs.service';

@Module({
  providers: [SolanaService, ProgramsService],
  exports: [SolanaService, ProgramsService],
})
export class SolanaModule {}
