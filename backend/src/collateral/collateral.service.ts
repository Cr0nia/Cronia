import { Injectable } from '@nestjs/common';
import { ProgramsService } from '../solana/programs.service';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { PrismaService } from '../database/prisma.service';
import { SolanaService } from '../solana/solana.service';
import {
  deriveAta,
  ensureAtasExist,
  prepareUnsignedTransaction,
  UnsignedTransactionResult,
} from '../solana/transaction.helpers';

@Injectable()
export class CollateralService {
  constructor(
    private readonly programs: ProgramsService,
    private readonly prisma: PrismaService,
    private readonly solana: SolanaService,
  ) {}

  private positionPda(owner: PublicKey, mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pos'), owner.toBuffer(), mint.toBuffer()],
      this.programs.collateralVaultProgramId,
    );
  }
  private vaultPda(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), mint.toBuffer()],
      this.programs.collateralVaultProgramId,
    );
  }
  private vaultCfgPda() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vault_cfg')],
      this.programs.collateralVaultProgramId,
    );
  }

  async openPosition(ownerPubkeyStr: string, mintStr: string) {
    const owner = new PublicKey(ownerPubkeyStr);
    const mint = new PublicKey(mintStr);
    const [posPda] = this.positionPda(owner, mint);

    await (this.programs.collateralVault as any).methods
      .openPositionPump()
      .accounts({
        position: posPda,
        owner,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await this.prisma.collateralPosition.upsert({
      where: { id: posPda.toBase58() },
      create: {
        id: posPda.toBase58(),
        ownerPubkey: owner.toBase58(),
        mint: mint.toBase58(),
        amount: 0,
        valuation: 0, 
        ltvBps: 0,
      },
      update: {},
    });

    return { positionPda: posPda.toBase58() };
  }

  async deposit(ownerPubkeyStr: string, mintStr: string, amount: number) {
    const owner = new PublicKey(ownerPubkeyStr);
    const mint = new PublicKey(mintStr);
    const [cfgPda] = this.vaultCfgPda();
    const [vaultPda] = this.vaultPda(mint);

    const ownerAta = deriveAta(mint, owner);
    const vaultAta = deriveAta(mint, vaultPda);

    await (this.programs.collateralVault as any).methods
      .depositPump(new anchor.BN(amount))
      .accounts({
        vaultConfig: cfgPda,
        vault: vaultPda,
        mint,
        ownerAta,
        vaultAta,
        owner,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await this.prisma.collateralPosition.upsert({
      where: { id: `${owner.toBase58()}-${mint.toBase58()}` },
      create: {
        id: `${owner.toBase58()}-${mint.toBase58()}`,
        ownerPubkey: owner.toBase58(),
        mint: mint.toBase58(),
        amount,
        valuation: 0, // <- 'valuation'
        ltvBps: 0,
      },
      update: { amount: { increment: amount } },
    });

    return { ok: true };
  }

  async withdraw(ownerPubkeyStr: string, mintStr: string, amount: number) {
    const owner = new PublicKey(ownerPubkeyStr);
    const mint = new PublicKey(mintStr);
    const [cfgPda] = this.vaultCfgPda();
    const [vaultPda] = this.vaultPda(mint);

    const ownerAta = deriveAta(mint, owner);
    const vaultAta = deriveAta(mint, vaultPda);

    await (this.programs.collateralVault as any).methods
      .withdrawPump(new anchor.BN(amount))
      .accounts({
        vaultConfig: cfgPda,
        vault: vaultPda,
        mint,
        vaultAta,
        ownerAta,
        owner,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await this.prisma.collateralPosition.updateMany({
      where: { ownerPubkey: owner.toBase58(), mint: mint.toBase58() },
      data: { amount: { decrement: amount } },
    });

    return { ok: true };
  }

  async setPrice(mintStr: string, priceUsdc6: number, ts: number) {
    const mint = new PublicKey(mintStr);
    const [pricePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('price'), mint.toBuffer()],
      this.programs.collateralVaultProgramId,
    );

    await (this.programs.collateralVault as any).methods
      .setPrice(new anchor.BN(priceUsdc6), new anchor.BN(ts))
      .accounts({
        priceAccount: pricePda,
        mint,
        admin: this.programs.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const existing = await this.prisma.price.findFirst({
      where: { mint: mint.toBase58() },
      select: { id: true },
    });

    if (!existing) {
      await this.prisma.price.create({
        data: {
          mint: mint.toBase58(),
          priceUsdc: priceUsdc6 / 1_000_000,
          lastTs: new Date(ts * 1000),
        },
      });
    } else {
      await this.prisma.price.update({
        where: { id: existing.id },
        data: {
          priceUsdc: priceUsdc6 / 1_000_000,
          lastTs: new Date(ts * 1000),
        },
      });
    }

    return { ok: true };
  }

private pumpClassPda() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('pump_class')],
    this.programs.collateralVaultProgramId,
  );
}
private pumpTokenPda(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('pump_token'), mint.toBuffer()],
    this.programs.collateralVaultProgramId,
  );
}

async initVaultConfig() {
  const [cfgPda] = this.vaultCfgPda();
  await (this.programs.collateralVault as any).methods
    .initVaultConfig()
    .accounts({
      vaultConfig: cfgPda,
      admin: this.programs.provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { vaultConfig: cfgPda.toBase58() };
}

async initVaultForMint(mintStr: string) {
  const mint = new PublicKey(mintStr);
  const [vaultPda] = this.vaultPda(mint);

  await (this.programs.collateralVault as any).methods
    .initVaultForMint()
    .accounts({
      vault: vaultPda,
      mint,
      admin: this.programs.provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { vault: vaultPda.toBase58(), mint: mint.toBase58() };
}

async setPumpClassParams() {
  const [pumpClass] = this.pumpClassPda();
  const [cfgPda] = this.vaultCfgPda();

  await (this.programs.collateralVault as any).methods
    .setPumpClassParams()
    .accounts({
      pumpClass,
      vaultConfig: cfgPda,
      admin: this.programs.provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { pumpClass: pumpClass.toBase58() };
}

async setPumpTokenParams(mintStr: string) {
  const mint = new PublicKey(mintStr);
  const [pumpToken] = this.pumpTokenPda(mint);
  const [pumpClass] = this.pumpClassPda();

  await (this.programs.collateralVault as any).methods
    .setPumpTokenParams()
    .accounts({
      pumpToken,
      mint,
      pumpClass,
      admin: this.programs.provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { pumpToken: pumpToken.toBase58(), mint: mint.toBase58() };
}

  async depositAsAdmin(mintStr: string, amount: number) {
    const owner = this.programs.provider.wallet.publicKey; // <- admin
    const mint = new PublicKey(mintStr);
    const [cfgPda] = this.vaultCfgPda();
    const [vaultPda] = this.vaultPda(mint);

    const ownerAta = deriveAta(mint, owner);
    const vaultAta = deriveAta(mint, vaultPda);

    await (this.programs.collateralVault as any).methods
        .depositPump(new anchor.BN(amount))
        .accounts({
        vaultConfig: cfgPda,
        vault: vaultPda,
        mint,
        ownerAta,
        vaultAta,
        owner,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        })
        .rpc();

    await this.prisma.collateralPosition.upsert({
        where: { id: `${owner.toBase58()}-${mint.toBase58()}` },
        create: {
        id: `${owner.toBase58()}-${mint.toBase58()}`,
        ownerPubkey: owner.toBase58(),
        mint: mint.toBase58(),
        amount,
        valuation: 0,
        ltvBps: 0,
        },
        update: { amount: { increment: amount } },
    });

    return {
        ok: true,
        owner: owner.toBase58(),
        mint: mint.toBase58(),
        amount,
    };
  }

  async getPositions(ownerPubkeyStr: string) {
    // Busca todas as posições do banco de dados
    const positions = await this.prisma.collateralPosition.findMany({
      where: { ownerPubkey: ownerPubkeyStr }
    });

    return {
      owner: ownerPubkeyStr,
      positions,
      count: positions.length,
    };
  }

  async getPosition(ownerPubkeyStr: string, mintStr: string) {
    const owner = new PublicKey(ownerPubkeyStr);
    const mint = new PublicKey(mintStr);
    const [posPda] = this.positionPda(owner, mint);

    try {
      // Tenta buscar a posição on-chain
      const onchainData = await (this.programs.collateralVault as any).account.position.fetch(posPda);

      // Busca os dados do banco
      const dbData = await this.prisma.collateralPosition.findFirst({
        where: {
          ownerPubkey: owner.toBase58(),
          mint: mint.toBase58()
        }
      });

      return {
        owner: owner.toBase58(),
        mint: mint.toBase58(),
        positionPda: posPda.toBase58(),
        onchain: onchainData,
        database: dbData,
      };
    } catch (error) {
      // Se não encontrar on-chain, retorna apenas os dados do banco
      const dbData = await this.prisma.collateralPosition.findFirst({
        where: {
          ownerPubkey: owner.toBase58(),
          mint: mint.toBase58()
        }
      });

      return {
        owner: owner.toBase58(),
        mint: mint.toBase58(),
        positionPda: posPda.toBase58(),
        error: 'Position not found on-chain',
        database: dbData,
      };
    }
  }

  // ==================== NOVOS MÉTODOS PARA TRANSAÇÕES NÃO ASSINADAS ====================

  /**
   * Prepara transação de abertura de posição (usuário precisa assinar)
   */
  async prepareOpenPosition(ownerPubkeyStr: string, mintStr: string): Promise<UnsignedTransactionResult> {
    const owner = new PublicKey(ownerPubkeyStr);
    const mint = new PublicKey(mintStr);
    const [posPda] = this.positionPda(owner, mint);

    const ix = await (this.programs.collateralVault as any).methods
      .openPositionPump()
      .accounts({
        position: posPda,
        owner,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    return prepareUnsignedTransaction(
      this.solana.connection,
      [ix],
      owner, // usuário paga as taxas
    );
  }

  /**
   * Prepara transação de depósito (usuário precisa assinar)
   * Inclui instruções para criar ATAs se necessário
   */
  async prepareDeposit(
    ownerPubkeyStr: string,
    mintStr: string,
    amount: number,
  ): Promise<UnsignedTransactionResult> {
    const owner = new PublicKey(ownerPubkeyStr);
    const mint = new PublicKey(mintStr);
    const [cfgPda] = this.vaultCfgPda();
    const [vaultPda] = this.vaultPda(mint);

    const ownerAta = deriveAta(mint, owner);
    const vaultAta = deriveAta(mint, vaultPda);

    // Cria instruções para criar ATAs se não existirem
    const ataInstructions = await ensureAtasExist(
      this.solana.connection,
      mint,
      [owner, vaultPda],
      owner, // usuário paga pela criação das ATAs
    );

    // Instrução do depósito
    const depositIx = await (this.programs.collateralVault as any).methods
      .depositPump(new anchor.BN(amount))
      .accounts({
        vaultConfig: cfgPda,
        vault: vaultPda,
        mint,
        ownerAta,
        vaultAta,
        owner,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // Combina todas as instruções
    return prepareUnsignedTransaction(
      this.solana.connection,
      [...ataInstructions, depositIx],
      owner,
    );
  }

  /**
   * Prepara transação de saque (usuário precisa assinar)
   */
  async prepareWithdraw(
    ownerPubkeyStr: string,
    mintStr: string,
    amount: number,
  ): Promise<UnsignedTransactionResult> {
    const owner = new PublicKey(ownerPubkeyStr);
    const mint = new PublicKey(mintStr);
    const [cfgPda] = this.vaultCfgPda();
    const [vaultPda] = this.vaultPda(mint);

    const ownerAta = deriveAta(mint, owner);
    const vaultAta = deriveAta(mint, vaultPda);

    // Garante que a ATA do owner existe (para receber)
    const ataInstructions = await ensureAtasExist(
      this.solana.connection,
      mint,
      [owner],
      owner,
    );

    const withdrawIx = await (this.programs.collateralVault as any).methods
      .withdrawPump(new anchor.BN(amount))
      .accounts({
        vaultConfig: cfgPda,
        vault: vaultPda,
        mint,
        vaultAta,
        ownerAta,
        owner,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    return prepareUnsignedTransaction(
      this.solana.connection,
      [...ataInstructions, withdrawIx],
      owner,
    );
  }
}
