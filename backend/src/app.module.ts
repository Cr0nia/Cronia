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
import { UsersModule } from './users/users.module';
import { CreditModule } from './credit/credit.module';
import { CollateralModule } from './collateral/collateral.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { StatementsModule } from './statements/statements.module';
import { PoolModule } from './pool/pool.module';
import { OracleModule } from './oracle/oracle.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    SolanaModule,
    AccountsModule,
    AuthModule,
    MerchantsModule,
    IntentsModule,
    UsersModule,
    CreditModule,
    CollateralModule,
    ReceivablesModule,
    StatementsModule,
    PoolModule,
    OracleModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
