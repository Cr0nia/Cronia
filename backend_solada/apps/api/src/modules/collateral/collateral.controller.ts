import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CollateralService } from './collateral.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DepositCollateralDto } from './dto/collateral.dto';

@ApiTags('collateral')
@Controller('collateral')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollateralController {
  constructor(private readonly collateralService: CollateralService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit collateral' })
  async deposit(@CurrentUser() user: any, @Body() dto: DepositCollateralDto) {
    return this.collateralService.deposit(user.id, dto);
  }

  @Delete(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw collateral' })
  @ApiParam({ name: 'id', type: 'string' })
  async withdraw(@Param('id') id: string, @CurrentUser() user: any) {
    return this.collateralService.withdraw(id, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get collateral deposits for credit account' })
  @ApiQuery({ name: 'creditAccountId', required: true })
  async getDeposits(@Query('creditAccountId') creditAccountId: string) {
    return this.collateralService.getDeposits(creditAccountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collateral deposit by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async getDeposit(@Param('id') id: string) {
    return this.collateralService.getDepositById(id);
  }
}
