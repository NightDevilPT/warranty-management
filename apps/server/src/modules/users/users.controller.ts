import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-email.dto';
import { Controller, Post, Body } from '@nestjs/common';
import { UserResponseDto } from './dto/response-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { IApiResponse } from 'interfaces/api-response.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided details',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.usersService.createUser(createUserDto);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify admin user email',
    description: 'Verifies admin user email address using token',
  })
  @ApiBody({ type: VerifyUserDto })
  @ApiResponse({
    status: 200,
    description: 'User verified successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid token or email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verifyUser(
    @Body() verifyUserDto: VerifyUserDto,
  ): Promise<UserResponseDto> {
    const { token, email } = verifyUserDto;
    return await this.usersService.verifyUser(token, email);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Login with email & password, returns JWT access token and user info',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200, description: 'Login successful',
    schema: {
      example: {
        status: "success",
        message: "Login successful",
        statusCode: 200,
        data: {
          user: {/* user fields */},
          accessToken: "jwt.token.string"
        },
        error: null
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.loginUser(loginUserDto);
  }
}
