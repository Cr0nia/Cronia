import { Injectable, Logger } from '@nestjs/common';
import { Cluster, Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  readonly commitment: Commitment;
  readonly connection: Connection;

  constructor() {
    const rpc = process.env.RPC_URL || 'https://api.devnet.solana.com';
    this.commitment = (process.env.COMMITMENT as Commitment) || 'confirmed';
    this.connection = new Connection(rpc, this.commitment);
  }

  /** Gera um par de chaves ed25519 (Keypair) */
  generateKeypair(): Keypair {
    return Keypair.generate();
  }

  /** Converte base58 -> PublicKey com validação */
  toPublicKey(base58: string): PublicKey {
    return new PublicKey(base58);
  }

  /** Saldo em SOL */
  async getSolBalance(pubkey: string | PublicKey): Promise<number> {
    const pk = typeof pubkey === 'string' ? new PublicKey(pubkey) : pubkey;
    const lamports = await this.connection.getBalance(pk, this.commitment);
    return lamports / LAMPORTS_PER_SOL;
  }

  /** Airdrop DEVNET */
  async airdropDevnet(pubkey: string | PublicKey, sol = 1) {
    const pk = typeof pubkey === 'string' ? new PublicKey(pubkey) : pubkey;
    const lamports = Math.floor(sol * LAMPORTS_PER_SOL);
    const sig = await this.connection.requestAirdrop(pk, lamports);
    await this.connection.confirmTransaction(sig, this.commitment);
    this.logger.log(`Airdrop ${sol} SOL -> ${pk.toBase58()} / tx: ${sig}`);
    return sig;
  }

  /** Ping simples */
  async health() {
    const [slot, epoch] = await Promise.all([
      this.connection.getSlot(this.commitment),
      this.connection.getEpochInfo(this.commitment),
    ]);
    return { slot, epoch: epoch.epoch };
  }
}
