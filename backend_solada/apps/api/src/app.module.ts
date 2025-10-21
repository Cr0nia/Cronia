import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConsumersModule } from './modules/consumers/consumers.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { ReceivablesModule } from './modules/receivables/receivables.module';
import { BillingModule } from './modules/billing/billing.module';
import { CollateralModule } from './modules/collateral/collateral.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Logger
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
      },
    }),

    // BullMQ (Redis Queue)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Database
    PrismaModule,

    // Feature Modules
    HealthModule,
    AuthModule,
    ConsumersModule,
    MerchantsModule,
    CheckoutModule,
    ReceivablesModule,
    BillingModule,
    CollateralModule,
    AdminModule,
  ],
})
export class AppModule {}
