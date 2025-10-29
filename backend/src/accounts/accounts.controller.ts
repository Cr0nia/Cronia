import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

/**
 * Endpoint opcional para o próprio usuário criar sua account+wallet
 * (útil pra reprocessar contas antigas ou testes).
 */
@Controller('accounts')
export class AccountsController {
  constructor(private service: AccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createForMe(@Req() req: any) {
    const userId = req.user.sub as string;
    return this.service.createUserAccount(userId);
  }
}
