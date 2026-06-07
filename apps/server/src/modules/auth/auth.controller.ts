// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Req, UseGuards, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login with email/password or passwordless (OTP)',
    description:
      'For password login, include email and password. For passwordless, include only email or phoneNumber.',
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful or OTP sent',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiConsumes('application/json')
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('send-otp')
  @ApiOperation({
    summary: 'Send OTP to email or phone',
    description: 'Sends a one-time password for authentication or verification',
  })
  @ApiResponse({
    status: 201,
    description: 'OTP sent successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiConsumes('application/json')
  @ApiBody({ type: SendOtpDto })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP and login',
    description: 'Verify the OTP code and get JWT tokens for authentication',
  })
  @ApiResponse({
    status: 201,
    description: 'OTP verified successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  @ApiConsumes('application/json')
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Uses refresh token from cookie to generate new token pair',
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Req() req: any) {
    // Guard already verified the refresh token and attached user
    // Now generate new tokens using refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logout and clear tokens',
    description: 'Clears JWT tokens from cookies and invalidates active OTPs',
  })
  @ApiResponse({
    status: 201,
    description: 'Logout successful',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const userId = req.user?.id;

    if (!userId) {
      return {
        data: null,
        message: 'User not authenticated',
      };
    }

    return this.authService.logout(userId, res);
  }
}
