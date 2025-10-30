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
export class ReceivablesService {
  private readonly logger = new Logger(ReceivablesService.name);
  private readonly receivablesProgramId: PublicKey;
  private readonly receivablesProgram: anchor.Program;

  constructor(
    private readonly programs: ProgramsService,
    private readonly solana: SolanaService,
    private readonly prisma: PrismaService,
  ) {
    // Program ID do receivables
    this.receivablesProgramId = new PublicKey(
      '89YkmHwfwtzEAoARKQ3m3QhLaYuJiBrKzYZrbZ6B8DGc',
    );

    // Carregar IDL do receivables - tenta múltiplos caminhos
    let receivablesIdl;
    const possiblePaths = [
      path.join(__dirname, '../../idl/receivables.json'),
      path.join(process.cwd(), 'idl/receivables.json'),
      path.join(process.cwd(), 'dist/idl/receivables.json'),
    ];

    for (const idlPath of possiblePaths) {
      try {
        if (fs.existsSync(idlPath)) {
          receivablesIdl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
          this.logger.log(`Loaded receivables IDL from: ${idlPath}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!receivablesIdl) {
      throw new Error('Could not find receivables.json IDL file');
    }

    const mutableIdl = { ...receivablesIdl };
    mutableIdl.address = this.receivablesProgramId.toBase58();

    this.receivablesProgram = new anchor.Program(
      mutableIdl as anchor.Idl,
      this.programs.provider,
    );
  }

  /**
   * Deriva o PDA da nota baseado no orderId e index
   */
  private notePda(orderId: Buffer, index: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('note'), orderId, Buffer.from([index])],
      this.receivablesProgramId,
    );
  }

  /**
   * Emite uma nota (parcela) - versão admin (backend assina)
   */
  async mintNote(
    orderId: string, // hex string 64 chars
    index: number,
    buyer: string,
    merchant: string,
    amountUsdc: number,
    dueTs: number,
  ) {
    const orderIdBuf = Buffer.from(orderId, 'hex');
    if (orderIdBuf.length !== 32) {
      throw new Error('orderId must be 32 bytes (64 hex chars)');
    }

    const buyerPk = new PublicKey(buyer);
    const merchantPk = new PublicKey(merchant);
    const [notePda] = this.notePda(orderIdBuf, index);

    const amount = new anchor.BN(Math.round(amountUsdc * 1_000_000));
    const dueTimestamp = new anchor.BN(dueTs);

    await (this.receivablesProgram as any).methods
      .mintNote(
        Array.from(orderIdBuf) as any,
        index,
        buyerPk,
        merchantPk,
        amount,
        dueTimestamp,
      )
      .accounts({
        payer: this.programs.provider.wallet.publicKey,
        noteState: notePda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Salvar no banco
    await this.prisma.receivableNote.create({
      data: {
        notePda: notePda.toBase58(),
        buyer: buyerPk.toBase58(),
        merchantId: merchantPk.toBase58(),
        beneficiary: merchantPk.toBase58(),
        amountUsdc,
        dueTs: new Date(dueTs * 1000),
        status: 'issued',
        orderId,
      },
    });

    return {
      notePda: notePda.toBase58(),
      orderId,
      index,
      buyer: buyerPk.toBase58(),
      merchant: merchantPk.toBase58(),
      amountUsdc,
      dueTs,
    };
  }

  /**
   * Prepara transação para emitir nota (usuário assina)
   */
  async prepareMintNote(
    payerPubkey: string,
    orderId: string,
    index: number,
    buyer: string,
    merchant: string,
    amountUsdc: number,
    dueTs: number,
  ): Promise<UnsignedTransactionResult> {
    const orderIdBuf = Buffer.from(orderId, 'hex');
    if (orderIdBuf.length !== 32) {
      throw new Error('orderId must be 32 bytes (64 hex chars)');
    }

    const payer = new PublicKey(payerPubkey);
    const buyerPk = new PublicKey(buyer);
    const merchantPk = new PublicKey(merchant);
    const [notePda] = this.notePda(orderIdBuf, index);

    const amount = new anchor.BN(Math.round(amountUsdc * 1_000_000));
    const dueTimestamp = new anchor.BN(dueTs);

    const ix = await (this.receivablesProgram as any).methods
      .mintNote(
        Array.from(orderIdBuf) as any,
        index,
        buyerPk,
        merchantPk,
        amount,
        dueTimestamp,
      )
      .accounts({
        payer,
        noteState: notePda,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    return prepareUnsignedTransaction(this.solana.connection, [ix], payer);
  }

  /**
   * Busca uma nota específica
   */
  async getNote(orderId: string, index: number) {
    const orderIdBuf = Buffer.from(orderId, 'hex');
    if (orderIdBuf.length !== 32) {
      throw new Error('orderId must be 32 bytes (64 hex chars)');
    }

    const [notePda] = this.notePda(orderIdBuf, index);

    try {
      // Buscar on-chain
      const onchainData = await (this.receivablesProgram as any).account.noteState.fetch(notePda);

      // Buscar no banco
      const dbData = await this.prisma.receivableNote.findUnique({
        where: { notePda: notePda.toBase58() },
      });

      return {
        notePda: notePda.toBase58(),
        orderId,
        index,
        onchain: onchainData,
        database: dbData,
      };
    } catch (error) {
      // Se não encontrar on-chain, retornar apenas do banco
      const dbData = await this.prisma.receivableNote.findUnique({
        where: { notePda: notePda.toBase58() },
      });

      return {
        notePda: notePda.toBase58(),
        orderId,
        index,
        error: 'Note not found on-chain',
        database: dbData,
      };
    }
  }

  /**
   * Lista todas as notas de um comprador
   */
  async getNotesByBuyer(buyer: string) {
    const notes = await this.prisma.receivableNote.findMany({
      where: { buyer },
      orderBy: { dueTs: 'asc' },
    });

    return {
      buyer,
      notes,
      count: notes.length,
      totalAmount: notes.reduce((sum, note) => sum + note.amountUsdc, 0),
    };
  }

  /**
   * Lista todas as notas de um merchant
   */
  async getNotesByMerchant(merchantId: string) {
    const notes = await this.prisma.receivableNote.findMany({
      where: { merchantId },
      orderBy: { dueTs: 'asc' },
    });

    return {
      merchantId,
      notes,
      count: notes.length,
      totalAmount: notes.reduce((sum, note) => sum + note.amountUsdc, 0),
    };
  }

  /**
   * Lista notas por status
   */
  async getNotesByStatus(status: string) {
    const notes = await this.prisma.receivableNote.findMany({
      where: { status },
      orderBy: { dueTs: 'asc' },
    });

    return {
      status,
      notes,
      count: notes.length,
      totalAmount: notes.reduce((sum, note) => sum + note.amountUsdc, 0),
    };
  }

  /**
   * Emite múltiplas notas de uma vez (para parcelamento)
   * Esta é a operação que o backend faria ao ouvir o evento ChargeAuthorized
   */
  async mintNotesForCharge(
    buyer: string,
    merchant: string,
    totalAmount: number,
    installments: number,
    orderId: string,
  ) {
    const notes: any[] = [];
    const amountPerInstallment = totalAmount / installments;
    const now = Math.floor(Date.now() / 1000);
    const MONTH_SECONDS = 30 * 24 * 60 * 60; // ~30 dias

    for (let i = 0; i < installments; i++) {
      const dueTs = now + (i + 1) * MONTH_SECONDS;

      const note = await this.mintNote(
        orderId,
        i,
        buyer,
        merchant,
        amountPerInstallment,
        dueTs,
      );

      notes.push(note);
    }

    return {
      orderId,
      buyer,
      merchant,
      totalAmount,
      installments,
      notes,
    };
  }
}
