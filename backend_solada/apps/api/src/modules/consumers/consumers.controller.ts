import { Controller, Get, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ConsumersService } from './consumers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateConsumerDto } from './dto/consumer.dto';

@ApiTags('consumers')
@Controller('consumers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current consumer profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.consumersService.findOne(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current consumer profile' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateConsumerDto) {
    return this.consumersService.update(user.id, dto);
  }

  @Get('me/credit-accounts')
  @ApiOperation({ summary: 'Get consumer credit accounts' })
  async getCreditAccounts(@CurrentUser() user: any) {
    return this.consumersService.getCreditAccounts(user.id);
  }

  @Get('me/transactions')
  @ApiOperation({ summary: 'Get consumer transaction history' })
  async getTransactions(@CurrentUser() user: any, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.consumersService.getTransactionHistory(user.id, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consumer by ID (admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async getConsumer(@Param('id') id: string) {
    return this.consumersService.findOne(id);
  }
}
