import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { DatabaseModule } from '../database/prisma.module';
import { SolanaModule } from '../solana/solana.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [DatabaseModule, SolanaModule, AuthModule],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
