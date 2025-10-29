import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/prisma.module';
import { SolanaModule } from './solana/solana.module';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { MerchantsModule } from './merchants/merchants.module';
import { IntentsModule } from './intents/intents.module';

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }),
DatabaseModule, SolanaModule, AccountsModule, AuthModule, MerchantsModule, IntentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
