import { Controller, Get, Post, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMerchantDto, UpdateMerchantDto } from './dto/merchant.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new merchant' })
  async register(@Body() dto: CreateMerchantDto) {
    return this.merchantsService.create(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current merchant profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.merchantsService.findOne(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current merchant profile' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateMerchantDto) {
    return this.merchantsService.update(user.id, dto);
  }

  @Post('me/regenerate-api-key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate merchant API key' })
  async regenerateApiKey(@CurrentUser() user: any) {
    return this.merchantsService.regenerateApiKey(user.id);
  }

  @Get('me/receivables')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant receivables' })
  async getReceivables(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.merchantsService.getReceivables(user.id, status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant by ID (admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  async getMerchant(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }
}
