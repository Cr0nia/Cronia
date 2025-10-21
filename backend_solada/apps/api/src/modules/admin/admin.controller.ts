import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  async getActivity(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.adminService.getRecentActivity(limitNum);
  }

  @Get('credit-accounts')
  @ApiOperation({ summary: 'Get all credit accounts' })
  @ApiQuery({ name: 'status', required: false })
  async getCreditAccounts(@Query('status') status?: string) {
    return this.adminService.getCreditAccounts(status);
  }
}
