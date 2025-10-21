import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCheckoutSessionDto } from './dto/checkout.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSession(merchantId: string, dto: CreateCheckoutSessionDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Generate session token
    const sessionToken = this.generateSessionToken();

    // Session expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const session = await this.prisma.checkoutSession.create({
      data: {
        merchantId,
        sessionToken,
        amount: dto.amount,
        currency: dto.currency || 'BRL',
        expiresAt,
        metadata: dto.metadata,
        status: 'pending',
      },
    });

    this.logger.log(`Checkout session created: ${session.id}`);

    return {
      sessionId: session.id,
      sessionToken: session.sessionToken,
      amount: session.amount,
      currency: session.currency,
      expiresAt: session.expiresAt,
      checkoutUrl: this.generateCheckoutUrl(session.sessionToken),
    };
  }

  async getSession(sessionToken: string) {
    const session = await this.prisma.checkoutSession.findUnique({
      where: { sessionToken },
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Checkout session not found');
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      await this.prisma.checkoutSession.update({
        where: { sessionToken },
        data: { status: 'expired' },
      });

      throw new BadRequestException('Checkout session expired');
    }

    return session;
  }

  async approveSession(sessionToken: string, consumerId: string) {
    const session = await this.getSession(sessionToken);

    if (session.status !== 'pending') {
      throw new BadRequestException('Session is not pending');
    }

    // Get consumer's credit account
    const creditAccount = await this.prisma.creditAccount.findFirst({
      where: {
        consumerId,
        status: 'active',
      },
    });

    if (!creditAccount) {
      throw new BadRequestException('No active credit account found');
    }

    // Check if consumer has enough available credit
    if (creditAccount.availableCredit < session.amount) {
      throw new BadRequestException('Insufficient credit available');
    }

    // Update session status
    const updatedSession = await this.prisma.checkoutSession.update({
      where: { sessionToken },
      data: {
        status: 'approved',
        consumerId,
      },
    });

    // Create receivable for merchant
    const receivable = await this.prisma.receivable.create({
      data: {
        merchantId: session.merchantId,
        checkoutSessionId: session.id,
        amount: session.amount,
        currency: session.currency,
        status: 'processing',
      },
    });

    // Update credit account
    await this.prisma.creditAccount.update({
      where: { id: creditAccount.id },
      data: {
        usedCredit: {
          increment: session.amount,
        },
        availableCredit: {
          decrement: session.amount,
        },
      },
    });

    // Create transaction record
    await this.prisma.transaction.create({
      data: {
        creditAccountId: creditAccount.id,
        consumerId,
        type: 'purchase',
        amount: session.amount,
        status: 'confirmed',
        metadata: {
          sessionId: session.id,
          merchantId: session.merchantId,
        },
      },
    });

    this.logger.log(`Checkout session approved: ${session.id}`);

    return {
      session: updatedSession,
      receivable,
    };
  }

  async rejectSession(sessionToken: string) {
    const session = await this.getSession(sessionToken);

    if (session.status !== 'pending') {
      throw new BadRequestException('Session is not pending');
    }

    await this.prisma.checkoutSession.update({
      where: { sessionToken },
      data: { status: 'rejected' },
    });

    this.logger.log(`Checkout session rejected: ${session.id}`);

    return { message: 'Session rejected' };
  }

  private generateSessionToken(): string {
    return `cs_${randomBytes(32).toString('hex')}`;
  }

  private generateCheckoutUrl(sessionToken: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return `${baseUrl}/checkout/${sessionToken}`;
  }
}
