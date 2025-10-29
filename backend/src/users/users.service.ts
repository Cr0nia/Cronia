import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserWithWallet(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { wallets: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Placeholder de score:
   * - 650 base
   * - +50 se usuário tem wallet verificada
   * - +50 se já confirmou alguma intent (status=confirmed)
   * Depois trocaremos por leitura on-chain (credit_account.score).
   */
  async getScore(id: string) {
    const user = await this.getUserWithWallet(id);

    const confirmedCount = await this.prisma.paymentIntent.count({
      where: { ownerPubkey: user.wallets?.[0]?.pubkey ?? undefined, status: 'confirmed' },
    });

    const hasWallet = Boolean(user.wallets?.length);
    let score = 650 + (hasWallet ? 50 : 0) + (confirmedCount > 0 ? 50 : 0);

    if (score > 900) score = 900;

    return { userId: id, score, method: 'placeholder', confirmedPurchases: confirmedCount };
  }
}
