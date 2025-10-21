import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReceivablesService } from './receivables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('receivables')
@Controller('receivables')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Get()
  @ApiOperation({ summary: 'List all receivables (merchant)' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.receivablesService.findAll(user.id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receivable by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string) {
    return this.receivablesService.findOne(id);
  }
}
