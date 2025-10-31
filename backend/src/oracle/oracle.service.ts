import { Injectable, Logger } from '@nestjs/common';
import { ProgramsService } from '../solana/programs.service';
import { SolanaService } from '../solana/solana.service';
import { PrismaService } from '../database/prisma.service';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);

  constructor(
    private readonly programs: ProgramsService,
    private readonly solana: SolanaService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Deriva o PDA da classe pump
   */
  private pumpClassPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pump_class')],
      this.programs.collateralVault.programId,
    );
  }

  /**
   * Deriva o PDA de um token pump
   */
  private pumpTokenPda(mint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pump_token'), mint.toBuffer()],
      this.programs.collateralVault.programId,
    );
  }

  /**
   * Define parâmetros da classe pump (LTV, haircut, etc)
   */
  async setPumpClass(maxLtv: number, haircut: number, minHolding = 0) {
    const [pumpClassPda] = this.pumpClassPda();

    const maxLtvBps = Math.floor(maxLtv * 100); // Converte para BPS
    const haircutBps = Math.floor(haircut * 100);
    const minHoldingSeconds = new anchor.BN(minHolding);

    await (this.programs.collateralVault as any).methods
      .setPumpClassParams(maxLtvBps, haircutBps, minHoldingSeconds)
      .accounts({
        admin: this.programs.provider.wallet.publicKey,
        pumpClass: pumpClassPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    this.logger.log(
      `Pump class configured: maxLtv=${maxLtv}%, haircut=${haircut}%`,
    );

    return {
      pumpClassPda: pumpClassPda.toBase58(),
      maxLtv,
      haircut,
      minHolding,
      message: 'Pump class parameters set successfully',
    };
  }

  /**
   * Registra um token pump com preço base
   */
  async setPumpToken(mintStr: string, basePrice: number, volatilityFactor = 1000) {
    const mint = new PublicKey(mintStr);
    const [pumpTokenPda] = this.pumpTokenPda(mint);

    // Converte preço para micro-USDC (6 decimals)
    const basePriceUsdc = new anchor.BN(Math.round(basePrice * 1_000_000));
    const volatilityBps = volatilityFactor;

    await (this.programs.collateralVault as any).methods
      .setPumpTokenParams(basePriceUsdc, volatilityBps)
      .accounts({
        admin: this.programs.provider.wallet.publicKey,
        pumpToken: pumpTokenPda,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Salvar asset no banco de dados
    await this.prisma.asset.upsert({
      where: { mint: mintStr },
      create: {
        mint: mintStr,
        symbol: 'PUMP', // TODO: Buscar via RPC
        name: 'Pump Token',
        decimals: 6,
        type: 'pump',
        defaultLtvBps: 5000, // 50% padrão
        haircutBps: 2000, // 20% padrão
      },
      update: {},
    });

    // Salvar preço inicial
    await this.updatePrice(mintStr, basePrice);

    this.logger.log(`Pump token registered: ${mintStr} @ $${basePrice}`);

    return {
      pumpTokenPda: pumpTokenPda.toBase58(),
      mint: mintStr,
      basePrice,
      volatilityFactor,
      message: 'Pump token registered successfully',
    };
  }

  /**
   * Atualiza preço de um ativo no banco de dados
   */
  async updatePrice(mintStr: string, price: number) {
    // Salvar preço no banco
    await this.prisma.price.upsert({
      where: { mint: mintStr },
      create: {
        mint: mintStr,
        priceUsdc: price,
        lastTs: new Date(),
      },
      update: {
        priceUsdc: price,
        lastTs: new Date(),
      },
    });

    this.logger.log(`Price updated: ${mintStr} = $${price}`);

    return {
      mint: mintStr,
      price,
      timestamp: new Date(),
      message: 'Price updated successfully',
    };
  }

  /**
   * Busca preço atual de um ativo
   */
  async getPrice(mintStr: string) {
    const price = await this.prisma.price.findUnique({
      where: { mint: mintStr },
    });

    if (!price) {
      return {
        mint: mintStr,
        error: 'Price not found',
      };
    }

    return {
      mint: mintStr,
      priceUsdc: price.priceUsdc,
      lastUpdated: price.lastTs,
    };
  }

  /**
   * Lista todos os assets cadastrados
   */
  async getAssets(type?: string) {
    const assets = await this.prisma.asset.findMany({
      where: type ? { type } : {},
      orderBy: { symbol: 'asc' },
    });

    return {
      assets,
      count: assets.length,
    };
  }

  /**
   * Busca informações on-chain da classe pump
   */
  async getPumpClassInfo() {
    const [pumpClassPda] = this.pumpClassPda();

    try {
      const classData = await (this.programs.collateralVault as any).account.pumpClass.fetch(
        pumpClassPda,
      );

      return {
        pumpClassPda: pumpClassPda.toBase58(),
        maxLtvBps: classData.maxLtvBps,
        haircutBps: classData.haircutBps,
        minHoldingSeconds: classData.minHoldingSeconds?.toString(),
      };
    } catch (error) {
      return {
        pumpClassPda: pumpClassPda.toBase58(),
        error: 'Pump class not found on-chain',
      };
    }
  }

  /**
   * Busca informações on-chain de um token pump
   */
  async getPumpTokenInfo(mintStr: string) {
    const mint = new PublicKey(mintStr);
    const [pumpTokenPda] = this.pumpTokenPda(mint);

    try {
      const tokenData = await (this.programs.collateralVault as any).account.pumpToken.fetch(
        pumpTokenPda,
      );

      return {
        pumpTokenPda: pumpTokenPda.toBase58(),
        mint: mintStr,
        basePriceUsdc: tokenData.basePriceUsdc?.toString(),
        volatilityBps: tokenData.volatilityBps,
      };
    } catch (error) {
      return {
        pumpTokenPda: pumpTokenPda.toBase58(),
        mint: mintStr,
        error: 'Pump token not found on-chain',
      };
    }
  }
}
