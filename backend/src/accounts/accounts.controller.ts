import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';


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
