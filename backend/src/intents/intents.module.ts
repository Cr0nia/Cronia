import { Module } from '@nestjs/common';
import { IntentsService } from './intents.service';
import { IntentsController } from './intents.controller';
import { DatabaseModule } from '../database/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { IntentsCron } from './intents.cron';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [DatabaseModule, AuthModule, ScheduleModule.forRoot()],
  providers: [IntentsService, IntentsCron],
  controllers: [IntentsController],
})
export class IntentsModule {}
