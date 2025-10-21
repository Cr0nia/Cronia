import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DepositCollateralDto } from './dto/collateral.dto';

@Injectable()
export class CollateralService {
  private readonly logger = new Logger(CollateralService.name);

  constructor(private readonly prisma: PrismaService) {}

  async deposit(consumerId: string, dto: DepositCollateralDto) {
    // Get or create credit account
    let creditAccount = await this.prisma.creditAccount.findFirst({
      where: { consumerId, status: 'active' },
    });

    if (!creditAccount) {
      // Create new credit account
      const initialCreditLimit = dto.valueUsd * dto.ltv;

      creditAccount = await this.prisma.creditAccount.create({
        data: {
          consumerId,
          pdaAddress: `pda_${Math.random().toString(36).substring(7)}`, // Mock PDA
          creditLimit: initialCreditLimit,
          availableCredit: initialCreditLimit,
          usedCredit: 0,
          totalCollateral: dto.valueUsd,
          healthFactor: 2.0,
          interestRate: 0.0299, // 2.99%
          status: 'active',
        },
      });
    }

    // Create collateral deposit
    const deposit = await this.prisma.collateralDeposit.create({
      data: {
        creditAccountId: creditAccount.id,
        consumerId,
        tokenMint: dto.tokenMint,
        tokenType: dto.tokenType,
        amount: dto.amount,
        valueUsd: dto.valueUsd,
        ltv: dto.ltv,
        status: 'active',
      },
    });

    // Update credit account totals
    const newTotalCollateral = creditAccount.totalCollateral.add(dto.valueUsd);
    const newCreditLimit = newTotalCollateral.mul(dto.ltv);

    await this.prisma.creditAccount.update({
      where: { id: creditAccount.id },
      data: {
        totalCollateral: newTotalCollateral,
        creditLimit: newCreditLimit,
        availableCredit: newCreditLimit.sub(creditAccount.usedCredit),
      },
    });

    // Create transaction record
    await this.prisma.transaction.create({
      data: {
        creditAccountId: creditAccount.id,
        consumerId,
        type: 'deposit',
        amount: dto.amount,
        tokenMint: dto.tokenMint,
        status: 'confirmed',
        metadata: {
          depositId: deposit.id,
          valueUsd: dto.valueUsd,
        },
      },
    });

    this.logger.log(`Collateral deposited: ${deposit.id} for consumer ${consumerId}`);

    return {
      deposit,
      creditAccount: await this.prisma.creditAccount.findUnique({
        where: { id: creditAccount.id },
      }),
    };
  }

  async withdraw(depositId: string, consumerId: string) {
    const deposit = await this.prisma.collateralDeposit.findUnique({
      where: { id: depositId },
      include: {
        creditAccount: true,
      },
    });

    if (!deposit) {
      throw new NotFoundException('Collateral deposit not found');
    }

    if (deposit.consumerId !== consumerId) {
      throw new BadRequestException('Unauthorized');
    }

    if (deposit.status !== 'active') {
      throw new BadRequestException('Collateral is not active');
    }

    // Check if withdrawal would make account unhealthy
    const newTotalCollateral = deposit.creditAccount.totalCollateral.sub(deposit.valueUsd);
    const newHealthFactor = newTotalCollateral.div(deposit.creditAccount.usedCredit);

    const minHealthFactor = parseFloat(process.env.MIN_HEALTH_FACTOR || '1.2');

    if (newHealthFactor.toNumber() < minHealthFactor) {
      throw new BadRequestException('Withdrawal would make account unhealthy');
    }

    // Update deposit status
    await this.prisma.collateralDeposit.update({
      where: { id: depositId },
      data: { status: 'withdrawn' },
    });

    // Update credit account
    const newCreditLimit = newTotalCollateral.mul(deposit.ltv);

    await this.prisma.creditAccount.update({
      where: { id: deposit.creditAccountId },
      data: {
        totalCollateral: newTotalCollateral,
        creditLimit: newCreditLimit,
        availableCredit: newCreditLimit.sub(deposit.creditAccount.usedCredit),
      },
    });

    // Create transaction record
    await this.prisma.transaction.create({
      data: {
        creditAccountId: deposit.creditAccountId,
        consumerId,
        type: 'withdrawal',
        amount: deposit.amount,
        tokenMint: deposit.tokenMint,
        status: 'confirmed',
        metadata: {
          depositId: deposit.id,
        },
      },
    });

    this.logger.log(`Collateral withdrawn: ${depositId}`);

    return { message: 'Collateral withdrawn successfully' };
  }

  async getDeposits(creditAccountId: string) {
    return this.prisma.collateralDeposit.findMany({
      where: { creditAccountId },
      orderBy: { depositedAt: 'desc' },
    });
  }

  async getDepositById(id: string) {
    const deposit = await this.prisma.collateralDeposit.findUnique({
      where: { id },
      include: {
        creditAccount: true,
        consumer: {
          select: {
            id: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!deposit) {
      throw new NotFoundException('Collateral deposit not found');
    }

    return deposit;
  }
}
