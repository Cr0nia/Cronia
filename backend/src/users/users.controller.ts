import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccountsService } from '../accounts/accounts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(
    private users: UsersService,
    private accounts: AccountsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/wallet')
  async createWallet(@Param('id') id: string) {
    const res = await this.accounts.createUserAccount(id);
    return { ok: true, ...res };
  }

  @Get(':id/score')
  async getScore(@Param('id') id: string) {
    return this.users.getScore(id);
  }
}
