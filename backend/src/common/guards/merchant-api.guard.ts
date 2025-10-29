import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { hashApiKey } from '../api-key.util';

@Injectable()
export class MerchantApiGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const raw = (req.headers['x-merchant-key'] || req.headers['x_merchant_key']) as string | undefined;
    if (!raw) throw new UnauthorizedException('Missing x-merchant-key');

    const h = hashApiKey(raw);
    const merchant = await this.prisma.merchant.findFirst({ where: { apiKeyHash: h } });
    if (!merchant) throw new UnauthorizedException('Invalid merchant key');

    req.merchant = merchant;
    return true;
  }
}
