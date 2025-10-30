import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Deriva a ATA para um mint e owner
 * Compatível com @solana/spl-token 0.1.8
 */
export function deriveAta(mint: PublicKey, owner: PublicKey): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return ata;
}

/**
 * Verifica se uma conta existe na blockchain
 */
export async function accountExists(
  connection: Connection,
  address: PublicKey,
): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(address);
    return accountInfo !== null;
  } catch {
    return false;
  }
}

/**
 * Cria uma instrução para inicializar uma ATA manualmente
 * Compatível com @solana/spl-token 0.1.8
 */
function createAssociatedTokenAccountInstructionManual(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
): TransactionInstruction {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedToken, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.alloc(0), // Instrução sem dados
  });
}

/**
 * Cria uma instrução para inicializar uma ATA se ela não existir
 */
export async function createAtaIfNeededInstruction(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
): Promise<TransactionInstruction | null> {
  const ata = deriveAta(mint, owner);
  const exists = await accountExists(connection, ata);

  if (exists) {
    return null; // ATA já existe
  }

  // Cria instrução para criar a ATA
  return createAssociatedTokenAccountInstructionManual(
    payer, // payer
    ata, // associatedToken
    owner, // owner
    mint, // mint
  );
}

/**
 * Garante que múltiplas ATAs existam, retornando instruções para criá-las
 */
export async function ensureAtasExist(
  connection: Connection,
  mint: PublicKey,
  owners: PublicKey[],
  payer: PublicKey,
): Promise<TransactionInstruction[]> {
  const instructions: TransactionInstruction[] = [];

  for (const owner of owners) {
    const ix = await createAtaIfNeededInstruction(connection, mint, owner, payer);
    if (ix) {
      instructions.push(ix);
    }
  }

  return instructions;
}

/**
 * Serializa uma transação para base64 (para enviar ao frontend assinar)
 */
export function serializeTransaction(tx: Transaction): string {
  return tx.serialize({ requireAllSignatures: false }).toString('base64');
}

/**
 * Helper para construir transações que serão assinadas pelo usuário
 */
export interface UnsignedTransactionResult {
  transaction: string; // base64 serializada
  message: string;
  blockhash: string;
  lastValidBlockHeight: number;
}

/**
 * Prepara uma transação não assinada para ser enviada ao frontend
 */
export async function prepareUnsignedTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  feePayer: PublicKey,
): Promise<UnsignedTransactionResult> {
  const tx = new Transaction();
  tx.add(...instructions);
  tx.feePayer = feePayer;

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;

  return {
    transaction: serializeTransaction(tx),
    message: 'Transaction ready for signing',
    blockhash,
    lastValidBlockHeight,
  };
}
