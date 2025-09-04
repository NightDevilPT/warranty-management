import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePasswordCommand } from '../impl/update-password.command';
import { UserRepository } from '../../../users/repository/user.repository';
import { JwtTokenService } from 'services/jwt-token-service/index.service';
import { HashService } from 'services/hash-service/index.service';
import {
  IApiResponse,
  ErrorTypes,
  ErrorResponseMessages,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { LoggerService } from 'services/logger-service/index.service';

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordHandler
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly hashService: HashService,
    private readonly httpErrorService: HttpErrorService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdatePasswordHandler.name);
  }

  async execute(command: UpdatePasswordCommand): Promise<IApiResponse<null>> {
    const { updatePasswordDto } = command;
    const { email, token, newPassword } = updatePasswordDto;

    this.logger.log(`Update password attempt for ${email}`);

    if (!email || !token || !newPassword) {
      throw this.httpErrorService.throwError(
        ErrorTypes.BadRequest,
        ErrorResponseMessages.INVALID_INPUT,
      );
    }

    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw this.httpErrorService.throwError(
        ErrorTypes.NotFound,
        ErrorResponseMessages.USER_NOT_FOUND,
      );
    }

    // Check if token matches and not expired
    if (
      user.token !== token ||
      !user.tokenExpire ||
      Date.now() > user.tokenExpire
    ) {
      throw this.httpErrorService.throwError(
        ErrorTypes.Unauthorized,
        ErrorResponseMessages.INVALID_VERIFICATION_TOKEN,
      );
    }

    // Verify token integrity
    const verified = this.jwtTokenService.verifyToken<{
      sub: string;
      email: string;
    }>(token);
    if (!verified) {
      throw this.httpErrorService.throwError(
        ErrorTypes.Unauthorized,
        ErrorResponseMessages.VERIFICATION_TOKEN_EXPIRED,
      );
    }

    // Hash new password
    const hashedPassword = await this.hashService.hashValue(newPassword);

    // Update user & clear reset token
    await this.userRepository.updateById(user.id, {
      password: hashedPassword,
      token: null,
      tokenExpire: null,
    });

    this.logger.log(`Password updated successfully for ${email}`);

    return {
      status: 'success',
      statusCode: 200,
      message: SuccessResponseMessages.USER_UPDATED_SUCCESSFULLY,
      data: null,
    };
  }
}
