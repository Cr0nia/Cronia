import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PublicKey } from '@solana/web3.js';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generate a challenge message for the wallet to sign
   */
  async generateChallenge(walletAddress: string): Promise<string> {
    const domain = this.config.get('SIWS_DOMAIN', 'localhost');
    const origin = this.config.get('SIWS_ORIGIN', 'http://localhost:3000');
    const nonce = this.generateNonce();
    const issuedAt = new Date().toISOString();

    const message = `${domain} wants you to sign in with your Solana account:
${walletAddress}

Sign in to Cronia

URI: ${origin}
Version: 1
Chain ID: solana:${this.config.get('SOLANA_NETWORK', 'devnet')}
Nonce: ${nonce}
Issued At: ${issuedAt}`;

    // Store challenge temporarily (in production, use Redis with TTL)
    // For now, we'll verify the signature directly
    return message;
  }

  /**
   * Verify wallet signature and issue JWT token
   */
  async verifyAndLogin(
    walletAddress: string,
    message: string,
    signature: string,
    userType: 'consumer' | 'merchant' = 'consumer',
  ): Promise<{ accessToken: string; user: any }> {
    try {
      // Verify the signature
      const isValid = this.verifySignature(walletAddress, message, signature);

      if (!isValid) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Find or create user
      let user;
      if (userType === 'consumer') {
        user = await this.prisma.consumer.upsert({
          where: { walletAddress },
          update: { updatedAt: new Date() },
          create: {
            walletAddress,
            kycStatus: 'pending',
          },
        });
      } else {
        user = await this.prisma.merchant.findUnique({
          where: { walletAddress },
        });

        if (!user) {
          throw new UnauthorizedException('Merchant not found. Please register first.');
        }
      }

      // Generate JWT
      const payload = {
        sub: user.id,
        walletAddress: user.walletAddress,
        type: userType,
      };

      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`User logged in: ${walletAddress} (${userType})`);

      return {
        accessToken,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          type: userType,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed for ${walletAddress}: ${error.message}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Verify Solana wallet signature
   */
  private verifySignature(walletAddress: string, message: string, signatureBase58: string): boolean {
    try {
      const publicKey = new PublicKey(walletAddress);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signatureBase58);

      return sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate a random nonce
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validate JWT token
   */
  async validateToken(payload: any) {
    const userType = payload.type;

    if (userType === 'consumer') {
      return this.prisma.consumer.findUnique({
        where: { id: payload.sub },
      });
    } else {
      return this.prisma.merchant.findUnique({
        where: { id: payload.sub },
      });
    }
  }
}
