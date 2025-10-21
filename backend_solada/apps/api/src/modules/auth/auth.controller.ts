import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChallengeDto, VerifyDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('challenge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authentication challenge for wallet' })
  @ApiBody({ type: ChallengeDto })
  async getChallenge(@Body() dto: ChallengeDto) {
    const message = await this.authService.generateChallenge(dto.walletAddress);

    return {
      message,
      walletAddress: dto.walletAddress,
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify signature and login' })
  @ApiBody({ type: VerifyDto })
  async verify(@Body() dto: VerifyDto) {
    const result = await this.authService.verifyAndLogin(
      dto.walletAddress,
      dto.message,
      dto.signature,
      dto.userType,
    );

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout (client-side token removal)' })
  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }
}
