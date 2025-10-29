import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class IntentsCron {
  private readonly logger = new Logger(IntentsCron.name);
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async expireIntents() {
    const now = new Date();
    const { count } = await this.prisma.paymentIntent.updateMany({
      where: {
        status: 'created',
        expiresAt: { not: null, lt: now },
      },
      data: { status: 'expired' },
    });
    if (count > 0) this.logger.log(`Expired ${count} intents`);
  }
}
