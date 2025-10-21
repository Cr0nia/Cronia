import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepaymentDto } from './dto/billing.dto';

@ApiTags('billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices for credit account' })
  @ApiQuery({ name: 'creditAccountId', required: true })
  @ApiQuery({ name: 'status', required: false })
  async getInvoices(
    @Query('creditAccountId') creditAccountId: string,
    @Query('status') status?: string,
  ) {
    return this.billingService.getInvoices(creditAccountId, status);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async getInvoice(@Param('id') id: string) {
    return this.billingService.getInvoiceById(id);
  }

  @Post('invoices/:id/repay')
  @ApiOperation({ summary: 'Repay invoice' })
  @ApiParam({ name: 'id', type: 'string' })
  async repay(@Param('id') id: string, @Body() dto: RepaymentDto) {
    return this.billingService.repayInvoice(id, dto);
  }
}
