import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCheckoutSessionDto, ApproveSessionDto } from './dto/checkout.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create checkout session (merchant)' })
  async createSession(@CurrentUser() user: any, @Body() dto: CreateCheckoutSessionDto) {
    return this.checkoutService.createSession(user.id, dto);
  }

  @Get('sessions/:token')
  @Public()
  @ApiOperation({ summary: 'Get checkout session by token' })
  @ApiParam({ name: 'token', type: 'string' })
  async getSession(@Param('token') token: string) {
    return this.checkoutService.getSession(token);
  }

  @Post('sessions/:token/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve checkout session (consumer)' })
  @ApiParam({ name: 'token', type: 'string' })
  async approveSession(@Param('token') token: string, @CurrentUser() user: any) {
    return this.checkoutService.approveSession(token, user.id);
  }

  @Post('sessions/:token/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject checkout session (consumer)' })
  @ApiParam({ name: 'token', type: 'string' })
  async rejectSession(@Param('token') token: string) {
    return this.checkoutService.rejectSession(token);
  }
}
