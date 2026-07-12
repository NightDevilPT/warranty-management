import { Controller, Post, Body, Param, Req, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Public } from 'decorators/public.decorator';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import {
  SendOtpResponseDto,
  VerifyOtpResponseDto,
} from './dto/otp-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Public()
  @Post(':portalType/send-otp')
  @ApiOperation({ summary: 'Send OTP for login' })
  @ApiParam({
    name: 'portalType',
    enum: ['admin', 'company', 'consumer'],
    description: 'Portal type for login',
  })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Organization hash is required' })
  @ApiResponse({
    status: 404,
    description: 'Organization not found or User not found',
  })
  @ApiResponse({ status: 403, description: 'Account is deactivated' })
  @ApiResponse({ status: 500, description: 'Failed to send OTP' })
  async sendOtp(
    @Param('portalType') portalType: string,
    @Body() dto: SendOtpDto,
  ): Promise<SendOtpResponseDto> {
    return this.otpService.sendOtp(dto, portalType);
  }

  @Public()
  @Post(':portalType/verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get tokens' })
  @ApiParam({
    name: 'portalType',
    enum: ['admin', 'company', 'consumer'],
    description: 'Portal type for login',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified, tokens returned',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Organization hash is required' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiResponse({
    status: 404,
    description: 'Organization not found or User not found',
  })
  @ApiResponse({ status: 403, description: 'Account is deactivated' })
  @ApiResponse({ status: 500, description: 'Failed to verify OTP' })
  async verifyOtp(
    @Param('portalType') portalType: string,
    @Body() dto: VerifyOtpDto,
  ): Promise<VerifyOtpResponseDto> {
    return this.otpService.verifyOtp(dto, portalType);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ message: string }> {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
