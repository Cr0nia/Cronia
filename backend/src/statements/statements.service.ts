import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ProgramsService } from '../solana/programs.service';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

@Injectable()
export class StatementsService {
  private readonly logger = new Logger(StatementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly programs: ProgramsService,
  ) {}

  /**
   * Gera fatura para um usuário baseado nas suas notas pendentes
   */
  async generateStatement(ownerPubkey: string, cycleId: string) {
    // Buscar conta de crédito do usuário
    const creditAccount = await this.prisma.creditAccount.findUnique({
      where: { ownerPubkey },
    });

    if (!creditAccount) {
      throw new Error('Credit account not found');
    }

    // Buscar todas as notas não pagas do usuário
    const notes = await this.prisma.receivableNote.findMany({
      where: {
        buyer: ownerPubkey,
        status: { in: ['issued', 'due_upcoming', 'due_today'] },
      },
      orderBy: { dueTs: 'asc' },
    });

    // Calcular total devido
    const totalDue = notes.reduce((sum, note) => sum + note.amountUsdc, 0);

    // Calcular pagamento mínimo (exemplo: 10% do total ou valor da próxima parcela)
    const nextDueNote = notes[0];
    const minPayment = Math.max(
      totalDue * 0.1, // 10% do total
      nextDueNote ? nextDueNote.amountUsdc : 0, // ou a próxima parcela
    );

    const closeTs = new Date();

    // Criar statement
    const statement = await this.prisma.statement.create({
      data: {
        ownerPubkey,
        cycleId,
        closeTs,
        totalDue,
        minPayment,
        items: {
          create: notes.map((note) => ({
            type: 'charge',
            amountUsdc: note.amountUsdc,
            metaJson: {
              notePda: note.notePda,
              orderId: note.orderId,
              dueTs: note.dueTs.toISOString(),
              merchant: note.merchantId,
            },
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Emitir evento on-chain (via credit_line::statement_close)
    try {
      const owner = new PublicKey(ownerPubkey);
      const [creditPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('credit'), owner.toBuffer()],
        this.programs.creditLineProgramId,
      );

      const cycleIdBuf = Buffer.from(cycleId.padEnd(8, '\0').slice(0, 8));

      await (this.programs.creditLine as any).methods
        .statementClose(Array.from(cycleIdBuf) as any)
        .accounts({
          creditAccount: creditPda,
        })
        .rpc();
    } catch (error) {
      this.logger.error('Error emitting statement close event', error);
      // Não falhar se o evento on-chain falhar
    }

    return statement;
  }

  /**
   * Busca statement por ID
   */
  async getStatement(statementId: string) {
    return this.prisma.statement.findUnique({
      where: { id: statementId },
      include: { items: true },
    });
  }

  /**
   * Lista statements de um usuário
   */
  async getStatementsByOwner(ownerPubkey: string) {
    const statements = await this.prisma.statement.findMany({
      where: { ownerPubkey },
      include: { items: true },
      orderBy: { closeTs: 'desc' },
    });

    return {
      ownerPubkey,
      statements,
      count: statements.length,
      totalOwed: statements.reduce((sum, st) => sum + st.totalDue, 0),
    };
  }

  /**
   * Busca o statement mais recente de um usuário
   */
  async getLatestStatement(ownerPubkey: string) {
    return this.prisma.statement.findFirst({
      where: { ownerPubkey },
      include: { items: true },
      orderBy: { closeTs: 'desc' },
    });
  }

  /**
   * Adiciona um item ao statement (por exemplo, juros, taxas)
   */
  async addStatementItem(
    statementId: string,
    type: string,
    amountUsdc: number,
    metaJson: any,
  ) {
    const item = await this.prisma.statementItem.create({
      data: {
        statementId,
        type,
        amountUsdc,
        metaJson,
      },
    });

    // Atualizar total do statement
    const statement = await this.prisma.statement.findUnique({
      where: { id: statementId },
      include: { items: true },
    });

    if (statement) {
      const newTotal = statement.items.reduce(
        (sum, item) => sum + item.amountUsdc,
        0,
      );

      await this.prisma.statement.update({
        where: { id: statementId },
        data: { totalDue: newTotal },
      });
    }

    return item;
  }

  /**
   * Gera statements para todos os usuários (job mensal)
   */
  async generateStatementsForAll() {
    const creditAccounts = await this.prisma.creditAccount.findMany({
      where: { status: 'active' },
    });

    const cycleId = new Date().toISOString().slice(0, 7); // YYYY-MM
    const results: any[] = [];

    for (const account of creditAccounts) {
      try {
        const statement = await this.generateStatement(
          account.ownerPubkey,
          cycleId,
        );
        results.push({ success: true, ownerPubkey: account.ownerPubkey, statement });
      } catch (error) {
        this.logger.error(
          `Error generating statement for ${account.ownerPubkey}`,
          error,
        );
        results.push({ success: false, ownerPubkey: account.ownerPubkey, error: error.message });
      }
    }

    return {
      cycleId,
      total: creditAccounts.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
}
