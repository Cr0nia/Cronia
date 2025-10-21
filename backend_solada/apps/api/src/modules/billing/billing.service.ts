import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RepaymentDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getInvoices(creditAccountId: string, status?: string) {
    const where: any = { creditAccountId };

    if (status) where.status = status;

    return this.prisma.invoice.findMany({
      where,
      orderBy: { dueDate: 'desc' },
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        creditAccount: {
          include: {
            consumer: {
              select: {
                id: true,
                walletAddress: true,
                fullName: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async createInvoice(creditAccountId: string, billingCycle: string) {
    const creditAccount = await this.prisma.creditAccount.findUnique({
      where: { id: creditAccountId },
    });

    if (!creditAccount) {
      throw new NotFoundException('Credit account not found');
    }

    // Calculate due date (1st of next month)
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Calculate interest
    const principalAmount = creditAccount.usedCredit;
    const interestAmount = principalAmount.mul(creditAccount.interestRate);
    const totalAmount = principalAmount.add(interestAmount);

    const invoice = await this.prisma.invoice.create({
      data: {
        creditAccountId,
        billingCycle,
        dueDate,
        totalAmount,
        principalAmount,
        interestAmount,
        feesAmount: 0,
        status: 'pending',
      },
    });

    this.logger.log(`Invoice created: ${invoice.id} for account ${creditAccountId}`);

    return invoice;
  }

  async repayInvoice(invoiceId: string, dto: RepaymentDto) {
    const invoice = await this.getInvoiceById(invoiceId);

    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice already paid');
    }

    if (dto.amount > invoice.totalAmount.sub(invoice.paidAmount).toNumber()) {
      throw new BadRequestException('Payment amount exceeds invoice balance');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        txSignature: dto.txSignature,
        status: 'pending',
      },
    });

    // Update invoice paid amount
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: {
          increment: dto.amount,
        },
      },
    });

    // Check if fully paid
    if (updatedInvoice.paidAmount >= updatedInvoice.totalAmount) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      });

      // Update credit account - restore available credit
      await this.prisma.creditAccount.update({
        where: { id: invoice.creditAccountId },
        data: {
          usedCredit: {
            decrement: updatedInvoice.principalAmount,
          },
          availableCredit: {
            increment: updatedInvoice.principalAmount,
          },
        },
      });

      this.logger.log(`Invoice ${invoiceId} fully paid`);
    }

    // Create transaction record
    await this.prisma.transaction.create({
      data: {
        creditAccountId: invoice.creditAccountId,
        consumerId: invoice.creditAccount.consumerId,
        type: 'payment',
        amount: dto.amount,
        txSignature: dto.txSignature,
        status: 'confirmed',
        metadata: {
          invoiceId,
          paymentId: payment.id,
        },
      },
    });

    return {
      payment,
      invoice: updatedInvoice,
    };
  }

  async markOverdue(invoiceId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'overdue' },
    });
  }

  async liquidateInvoice(invoiceId: string) {
    const invoice = await this.getInvoiceById(invoiceId);

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'liquidated' },
    });

    // Update credit account status
    await this.prisma.creditAccount.update({
      where: { id: invoice.creditAccountId },
      data: { status: 'liquidated' },
    });

    this.logger.log(`Invoice ${invoiceId} liquidated`);

    return { message: 'Invoice liquidated' };
  }
}
