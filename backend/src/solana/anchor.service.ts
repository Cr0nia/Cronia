import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import { SolanaService } from '../solana/solana.service';

@Injectable()
export class AnchorService {
  public readonly provider: anchor.AnchorProvider;

  constructor(private readonly solana: SolanaService) {
    const kpPath = process.env.ANCHOR_WALLET!;
    if (!kpPath || !fs.existsSync(kpPath)) {
      throw new Error('Defina ANCHOR_WALLET apontando para o keypair JSON (array de 64 bytes).');
    }
    const secret = Uint8Array.from(JSON.parse(fs.readFileSync(kpPath, 'utf8')));
    const keypair = Keypair.fromSecretKey(secret);
    const wallet = new anchor.Wallet(keypair);

    this.provider = new anchor.AnchorProvider(this.solana.connection, wallet, {
      commitment: this.solana.commitment,
      preflightCommitment: this.solana.commitment,
    });
    anchor.setProvider(this.provider);
  }

  get adminPubkey(): PublicKey {
    return this.provider.publicKey;
  }
}
