import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import { SolanaService } from './solana.service';
// @ts-ignore
import * as creditLineIdl from '../../idl/credit_line.json';
// @ts-ignore
import * as collateralVaultIdl from '../../idl/collateral_vault.json';
import { ConfigService } from '@nestjs/config'; 

@Injectable()
export class ProgramsService {
  public readonly provider: anchor.AnchorProvider;
  public readonly creditLine: anchor.Program;
  public readonly collateralVault: anchor.Program;

  public readonly creditLineProgramId: PublicKey;
  public readonly collateralVaultProgramId: PublicKey;

  constructor(
    private readonly solana: SolanaService,
    private readonly configService: ConfigService, 
  ) {
    
    const kpPath = this.configService.get<string>('ANCHOR_WALLET');
    if (!kpPath || !fs.existsSync(kpPath)) {
      throw new Error('ANCHOR_WALLET não definida ou caminho inválido.');
    }

    const creditLineEnv = this.configService.get<string>('PROGRAM_ID_CREDIT_LINE');
    const collateralVaultEnv = this.configService.get<string>('PROGRAM_ID_COLLATERAL_VAULT');

    if (!creditLineEnv || !collateralVaultEnv) {
      throw new Error('IDs dos programas não definidos no .env');
    }

    const secret = Uint8Array.from(JSON.parse(fs.readFileSync(kpPath, 'utf8')));
    const kp = Keypair.fromSecretKey(secret);
    const wallet = new anchor.Wallet(kp);

    this.provider = new anchor.AnchorProvider(this.solana.connection, wallet, {
      commitment: this.solana.commitment,
      preflightCommitment: this.solana.commitment,
    });
    anchor.setProvider(this.provider);

    this.creditLineProgramId = new PublicKey(creditLineEnv);
    this.collateralVaultProgramId = new PublicKey(collateralVaultEnv);

    const mutableCreditLineIdl = { ...creditLineIdl };
    const mutableCollateralVaultIdl = { ...collateralVaultIdl };

    mutableCreditLineIdl.address = this.creditLineProgramId.toBase58();
    mutableCollateralVaultIdl.address = this.collateralVaultProgramId.toBase58();

    this.creditLine = new anchor.Program(
      mutableCreditLineIdl as anchor.Idl, 
      this.provider
    );
    this.collateralVault = new anchor.Program(
      mutableCollateralVaultIdl as anchor.Idl, 
      this.provider
    );
  }
}