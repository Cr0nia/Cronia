import { Module } from '@nestjs/common';
import { IntentsService } from './intents.service';
import { IntentsController } from './intents.controller';
import { DatabaseModule } from '../database/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [IntentsService],
  controllers: [IntentsController],
})
export class IntentsModule {}
