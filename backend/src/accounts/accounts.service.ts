import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SolanaService } from '../solana/solana.service';
import { Keypair } from '@solana/web3.js';
import { encryptGCM } from '../common/crypto.util';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private solana: SolanaService,
  ) {}

  async createUserAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const kp: Keypair = this.solana.generateKeypair();
    const pubkey = kp.publicKey.toBase58();
    const secret = Buffer.from(kp.secretKey);

    const encKey = process.env.WALLET_ENC_KEY_BASE64!;
    const encrypted = encryptGCM(secret, encKey);
    const skEncrypted = JSON.stringify(encrypted);

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        pubkey,
        custodied: true,
        aaRef: null,
        skEncrypted,
      },
    });

    if (process.env.DEVNET_AUTO_AIRDROP_SOL) {
      const sol = Number(process.env.DEVNET_AUTO_AIRDROP_SOL) || 1;
      try { await this.solana.airdropDevnet(pubkey, sol); } catch {}
    }

    return {
      userId,
      walletId: wallet.id,
      pubkey,
    };
  }
}
