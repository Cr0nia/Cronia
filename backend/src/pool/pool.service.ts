import { Injectable, Logger } from '@nestjs/common';
import { ProgramsService } from '../solana/programs.service';
import { SolanaService } from '../solana/solana.service';
import { PrismaService } from '../database/prisma.service';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import * as path from 'path';
import * as fs from 'fs';
import {
  prepareUnsignedTransaction,
  UnsignedTransactionResult,
} from '../solana/transaction.helpers';

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);
  private readonly poolProgramId: PublicKey;
  private readonly poolProgram: anchor.Program;

  constructor(
    private readonly programs: ProgramsService,
    private readonly solana: SolanaService,
    private readonly prisma: PrismaService,
  ) {
    // Program ID do advance_pool
    this.poolProgramId = new PublicKey(
      '8zKbc5hProPy7xB2M5iDKABCLhcb68ezdyAixiC7NcDe',
    );

    // Carregar IDL do advance_pool - tenta múltiplos caminhos
    let poolIdl;
    const possiblePaths = [
      path.join(__dirname, '../../idl/advance_pool.json'),
      path.join(process.cwd(), 'idl/advance_pool.json'),
      path.join(process.cwd(), 'dist/idl/advance_pool.json'),
    ];

    for (const idlPath of possiblePaths) {
      try {
        if (fs.existsSync(idlPath)) {
          poolIdl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
          this.logger.log(`Loaded advance_pool IDL from: ${idlPath}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!poolIdl) {
      throw new Error('Could not find advance_pool.json IDL file');
    }

    const mutableIdl = { ...poolIdl };
    mutableIdl.address = this.poolProgramId.toBase58();

    this.poolProgram = new anchor.Program(
      mutableIdl as anchor.Idl,
      this.programs.provider,
    );
  }

  /**
   * Deriva o PDA do pool baseado no admin
   */
  private poolPda(admin: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), admin.toBuffer()],
      this.poolProgramId,
    );
  }

  /**
   * Inicializa o pool de liquidez - versão admin (backend assina)
   */
  async initPool() {
    const admin = this.programs.provider.wallet.publicKey;
    const [poolPda] = this.poolPda(admin);

    await (this.poolProgram as any).methods
      .initPool()
      .accounts({
        admin,
        pool: poolPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return {
      poolPda: poolPda.toBase58(),
      admin: admin.toBase58(),
      message: 'Pool initialized successfully',
    };
  }

  /**
   * Prepara transação para inicializar pool (usuário assina)
   */
  async prepareInitPool(
    adminPubkey: string,
  ): Promise<UnsignedTransactionResult> {
    const admin = new PublicKey(adminPubkey);
    const [poolPda] = this.poolPda(admin);

    const ix = await (this.poolProgram as any).methods
      .initPool()
      .accounts({
        admin,
        pool: poolPda,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    return prepareUnsignedTransaction(this.solana.connection, [ix], admin);
  }

  /**
   * Reabastece a reserva do pool - versão admin (backend assina)
   */
  async replenishReserve(amount: number) {
    const admin = this.programs.provider.wallet.publicKey;
    const [poolPda] = this.poolPda(admin);

    const amountBn = new anchor.BN(Math.round(amount * 1_000_000));

    await (this.poolProgram as any).methods
      .replenishReserve(amountBn)
      .accounts({
        admin,
        pool: poolPda,
      })
      .rpc();

    return {
      poolPda: poolPda.toBase58(),
      amount,
      message: 'Reserve replenished successfully',
    };
  }

  /**
   * Prepara transação para reabastecer reserva
   */
  async prepareReplenishReserve(
    adminPubkey: string,
    amount: number,
  ): Promise<UnsignedTransactionResult> {
    const admin = new PublicKey(adminPubkey);
    const [poolPda] = this.poolPda(admin);

    const amountBn = new anchor.BN(Math.round(amount * 1_000_000));

    const ix = await (this.poolProgram as any).methods
      .replenishReserve(amountBn)
      .accounts({
        admin,
        pool: poolPda,
      })
      .instruction();

    return prepareUnsignedTransaction(this.solana.connection, [ix], admin);
  }

  /**
   * Antecipa uma nota (advance) - paga antecipado ao merchant com desconto
   * Versão admin (backend assina)
   */
  async advanceNote(notePda: string) {
    const admin = this.programs.provider.wallet.publicKey;
    const [poolPda] = this.poolPda(admin);
    const noteStatePk = new PublicKey(notePda);

    const tx = await (this.poolProgram as any).methods
      .advance()
      .accounts({
        pool: poolPda,
        admin,
        noteState: noteStatePk,
      })
      .rpc();

    // Buscar evento emitido para pegar os valores
    // (em produção, escutaríamos eventos via websocket)

    // Salvar no banco
    await this.prisma.poolAdvance.create({
      data: {
        notePda,
        poolPda: poolPda.toBase58(),
        txSignature: tx,
        status: 'completed',
      },
    });

    return {
      notePda,
      poolPda: poolPda.toBase58(),
      txSignature: tx,
      message: 'Note advanced successfully',
    };
  }

  /**
   * Prepara transação para antecipar nota
   */
  async prepareAdvanceNote(
    adminPubkey: string,
    notePda: string,
  ): Promise<UnsignedTransactionResult> {
    const admin = new PublicKey(adminPubkey);
    const [poolPda] = this.poolPda(admin);
    const noteStatePk = new PublicKey(notePda);

    const ix = await (this.poolProgram as any).methods
      .advance()
      .accounts({
        pool: poolPda,
        admin,
        noteState: noteStatePk,
      })
      .instruction();

    return prepareUnsignedTransaction(this.solana.connection, [ix], admin);
  }

  /**
   * Liquida garantia quando comprador não paga
   * Versão admin (backend assina)
   */
  async guaranteeSettle(notePda: string) {
    const admin = this.programs.provider.wallet.publicKey;
    const [poolPda] = this.poolPda(admin);
    const noteStatePk = new PublicKey(notePda);

    const tx = await (this.poolProgram as any).methods
      .guaranteeSettle()
      .accounts({
        pool: poolPda,
        admin,
        noteState: noteStatePk,
      })
      .rpc();

    // Atualizar status no banco
    await this.prisma.poolAdvance.updateMany({
      where: { notePda, status: 'completed' },
      data: { status: 'settled' },
    });

    return {
      notePda,
      poolPda: poolPda.toBase58(),
      txSignature: tx,
      message: 'Guarantee settled successfully',
    };
  }

  /**
   * Prepara transação para liquidar garantia
   */
  async prepareGuaranteeSettle(
    adminPubkey: string,
    notePda: string,
  ): Promise<UnsignedTransactionResult> {
    const admin = new PublicKey(adminPubkey);
    const [poolPda] = this.poolPda(admin);
    const noteStatePk = new PublicKey(notePda);

    const ix = await (this.poolProgram as any).methods
      .guaranteeSettle()
      .accounts({
        pool: poolPda,
        admin,
        noteState: noteStatePk,
      })
      .instruction();

    return prepareUnsignedTransaction(this.solana.connection, [ix], admin);
  }

  /**
   * Busca informações do pool
   */
  async getPoolInfo(adminPubkey: string) {
    const admin = new PublicKey(adminPubkey);
    const [poolPda] = this.poolPda(admin);

    try {
      const poolData = await (this.poolProgram as any).account.pool.fetch(poolPda);

      return {
        poolPda: poolPda.toBase58(),
        admin: poolData.admin.toBase58(),
        usdcVault: poolData.usdcVault.toBase58(),
        guaranteeReserveUsdc: poolData.guaranteeReserveUsdc.toString(),
        bump: poolData.bump,
      };
    } catch (error) {
      return {
        poolPda: poolPda.toBase58(),
        error: 'Pool not found on-chain',
      };
    }
  }

  /**
   * Lista histórico de antecipações
   */
  async getAdvanceHistory(poolPda?: string) {
    const advances = await this.prisma.poolAdvance.findMany({
      where: poolPda ? { poolPda } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        note: true, // Se tiver relação com ReceivableNote
      },
    });

    return {
      poolPda,
      advances,
      count: advances.length,
    };
  }

  /**
   * Busca antecipação por nota
   */
  async getAdvanceByNote(notePda: string) {
    const advance = await this.prisma.poolAdvance.findFirst({
      where: { notePda },
      include: {
        note: true,
      },
    });

    if (!advance) {
      return {
        notePda,
        error: 'Advance not found',
      };
    }

    return advance;
  }
}
