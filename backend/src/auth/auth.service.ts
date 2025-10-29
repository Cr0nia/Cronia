import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private accounts: AccountsService, // <— injeta
  ) {}

  async signup(data: { email: string; name: string; phone?: string; password?: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;

    const user = await this.prisma.user.create({
      data: { email: data.email, name: data.name, phone: data.phone, passwordHash },
    });

    await this.accounts.createUserAccount(user.id);

    const token = await this.sign(user.id, user.email);
    return { userId: user.id, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = await this.sign(user.id, user.email);
    return { userId: user.id, token };
  }

  async sign(sub: string, email: string) {
    return this.jwt.signAsync({ sub, email });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallets: true, creditAccount: true },
    });
    return user;
  }
}
