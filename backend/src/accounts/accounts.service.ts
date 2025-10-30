import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SolanaService } from '../solana/solana.service';
import { Keypair, PublicKey } from '@solana/web3.js';
import { encryptGCM } from '../common/crypto.util';
import * as fs from 'fs';


@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private solana: SolanaService,
  ) {}

  private getAdminPubkeyFromAnchorWallet(): string {
    const kpPath = process.env.ANCHOR_WALLET;
    if (!kpPath || !fs.existsSync(kpPath)) {
      throw new Error('ANCHOR_WALLET não definido ou arquivo inexistente (necessário para obter pubkey do admin).');
    }
    const secret = Uint8Array.from(JSON.parse(fs.readFileSync(kpPath, 'utf8')));
    const kp = Keypair.fromSecretKey(secret);
    return kp.publicKey.toBase58();
  }

  async createUserAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const useAdminAsOwner = (process.env.ADMIN_AS_OWNER === 'true');

    if (useAdminAsOwner) {
      const adminPubkey = this.getAdminPubkeyFromAnchorWallet();

      const wallet = await this.prisma.wallet.create({
        data: {
          userId,
          pubkey: adminPubkey,
          custodied: true,
          aaRef: null,
          skEncrypted: null, 
        },
      });

      if (process.env.DEVNET_AUTO_AIRDROP_SOL && Number(process.env.DEVNET_AUTO_AIRDROP_SOL) > 0) {
        try {
          await this.solana.airdropDevnet(adminPubkey, Number(process.env.DEVNET_AUTO_AIRDROP_SOL));
        } catch (e) {
        }
      }

      return {
        userId,
        walletId: wallet.id,
        pubkey: adminPubkey,
        note: 'admin-as-owner: esta wallet referencia a chave admin (ANCHOR_WALLET). Use somente em ambiente de teste/local.',
      };
    }

    // comportamento padrão: gerar keypair para o usuário e armazenar secret encriptada
    const kp: Keypair = this.solana.generateKeypair();
    const pubkey = kp.publicKey.toBase58();
    const secret = Buffer.from(kp.secretKey);

    const encKey = process.env.WALLET_ENC_KEY_BASE64!;
    if (!encKey) throw new Error('WALLET_ENC_KEY_BASE64 não definido no .env (necessário para encriptar secret).');
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
