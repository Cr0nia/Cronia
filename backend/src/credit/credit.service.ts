import { Injectable, Logger } from '@nestjs/common';
import { ProgramsService } from '../solana/programs.service';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { PrismaService } from '../database/prisma.service';
import { SolanaService } from '../solana/solana.service';
import {
  prepareUnsignedTransaction,
  UnsignedTransactionResult,
} from '../solana/transaction.helpers';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);
  constructor(
    private readonly programs: ProgramsService,
    private readonly prisma: PrismaService,
    private readonly solana: SolanaService,
  ) {}

  private creditPda(owner: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('credit'), owner.toBuffer()],
      this.programs.creditLineProgramId,
    );
  }
  private configPda() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('credit_config')],
      this.programs.creditLineProgramId,
    );
  }

  async openAccount(ownerPubkeyStr: string) {
    const owner = new PublicKey(ownerPubkeyStr);
    const [creditPda] = this.creditPda(owner);

    await this.programs.creditLine.methods
      .openAccount()
      .accounts({
        owner,
        creditAccount: creditPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await this.prisma.creditAccount.upsert({
      where: { ownerPubkey: owner.toBase58() },
      create: { ownerPubkey: owner.toBase58() },
      update: {},
    });

    return { creditPda: creditPda.toBase58() };
  }

  async setLimit(ownerPubkeyStr: string, newLimitUsdc: number) {
    const owner = new PublicKey(ownerPubkeyStr);
    const [creditPda] = this.creditPda(owner);
    const [configPda] = this.configPda();
    const scaled = new anchor.BN(Math.round(newLimitUsdc * 1_000_000));

    await this.programs.creditLine.methods
      .setLimit(scaled)
      .accounts({
        admin: this.programs.provider.wallet.publicKey,
        config: configPda,
        creditAccount: creditPda,
        owner,
      })
      .rpc();

    await this.prisma.creditAccount.update({
      where: { ownerPubkey: owner.toBase58() },
      data: { limitUsdc: newLimitUsdc },
    });

    return { ok: true };
  }

  async charge(ownerPubkeyStr: string, amountUsdc: number, installments: number, orderIdHex: string) {
    const owner = new PublicKey(ownerPubkeyStr);
    const [creditPda] = this.creditPda(owner);
    const [configPda] = this.configPda();

    const amount = new anchor.BN(Math.round(amountUsdc * 1_000_000));
    const orderIdBuf = Buffer.from(orderIdHex, 'hex');
    if (orderIdBuf.length !== 32) throw new Error('orderIdHex deve ter 32 bytes (64 hex).');

    await this.programs.creditLine.methods
      .charge(amount, installments, Array.from(orderIdBuf) as any)
      .accounts({ creditAccount: creditPda, config: configPda })
      .rpc();

    await this.prisma.creditAccount.update({
      where: { ownerPubkey: owner.toBase58() },
      data: { usedUsdc: { increment: amountUsdc } },
    });

    return { ok: true };
  }

  async repay(ownerPubkeyStr: string, amountUsdc: number) {
    const owner = new PublicKey(ownerPubkeyStr);
    const [creditPda] = this.creditPda(owner);
    const amount = new anchor.BN(Math.round(amountUsdc * 1_000_000));

    await this.programs.creditLine.methods
      .repay(amount)
      .accounts({ creditAccount: creditPda })
      .rpc();

    await this.prisma.creditAccount.update({
      where: { ownerPubkey: owner.toBase58() },
      data: { usedUsdc: { decrement: amountUsdc } },
    });

    return { ok: true };
  }

  async openAccountAsAdmin() {
    const owner = this.programs.provider.wallet.publicKey;
    const [creditPda] = this.creditPda(owner);

    await this.programs.creditLine.methods
      .openAccount()
      .accounts({
        owner,
        creditAccount: creditPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await this.prisma.creditAccount.upsert({
      where: { ownerPubkey: owner.toBase58() },
      create: { ownerPubkey: owner.toBase58(), limitUsdc: 0, usedUsdc: 0 },
      update: {},
    });

    return { creditPda: creditPda.toBase58(), owner: owner.toBase58() };
  }

  async getAccount(ownerPubkeyStr: string) {
    const owner = new PublicKey(ownerPubkeyStr);
    const [creditPda] = this.creditPda(owner);

    try {
      // Busca a conta on-chain
      const accountData = await (this.programs.creditLine as any).account.creditAccount.fetch(creditPda);

      // Busca os dados do banco
      const dbData = await this.prisma.creditAccount.findUnique({
        where: { ownerPubkey: owner.toBase58() }
      });

      return {
        owner: owner.toBase58(),
        creditPda: creditPda.toBase58(),
        onchain: accountData,
        database: dbData,
      };
    } catch (error) {
      return {
        owner: owner.toBase58(),
        creditPda: creditPda.toBase58(),
        error: 'Account not found on-chain',
        database: await this.prisma.creditAccount.findUnique({
          where: { ownerPubkey: owner.toBase58() }
        }),
      };
    }
  }

  // ==================== NOVOS MÉTODOS PARA TRANSAÇÕES NÃO ASSINADAS ====================

  /**
   * Prepara transação de abertura de conta (usuário precisa assinar)
   */
  async prepareOpenAccount(ownerPubkeyStr: string): Promise<UnsignedTransactionResult> {
    const owner = new PublicKey(ownerPubkeyStr);
    const [creditPda] = this.creditPda(owner);

    const ix = await this.programs.creditLine.methods
      .openAccount()
      .accounts({
        owner,
        creditAccount: creditPda,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    return prepareUnsignedTransaction(
      this.solana.connection,
      [ix],
      owner,
    );
  }
}
