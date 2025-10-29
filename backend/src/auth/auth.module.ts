// 1. Importe o forwardRef
import { Module, forwardRef } from '@nestjs/common'; 
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/prisma.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AccountsModule), 
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): JwtModuleOptions => {
        const secret = cfg.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET not set');
        }
        const expires = Number(cfg.get<string>('JWT_EXPIRES_SECONDS') ?? 60 * 60 * 24 * 7);
        return { secret, signOptions: { expiresIn: expires } };
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}