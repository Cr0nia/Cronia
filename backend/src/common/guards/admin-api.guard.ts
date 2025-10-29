import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminApiGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const key = (req.headers['x-api-key'] || req.headers['x-api_key'] || req.headers['apikey']) as string | undefined;
    if (!key || key !== process.env.ADMIN_API_KEY) {
      throw new UnauthorizedException('Invalid admin API key');
    }
    return true;
  }
}
