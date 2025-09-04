import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgetPasswordCommand } from '../impl/forget-password.command';
import { UserRepository } from '../../../users/repository/user.repository';
import { JwtTokenService } from 'services/jwt-token-service/index.service';
import { MailSenderService } from 'services/mail/services/mail-sender.service';
import { MailProvider } from 'services/mail/interface';
import { TemplateEnum } from 'services/mail/helpers/template-generator';
import {
  IApiResponse,
  ErrorTypes,
  ErrorResponseMessages,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { LoggerService } from 'services/logger-service/index.service';
import { ConfigService } from '@nestjs/config';
import { RoleConfigUrlMap } from 'interfaces/url.interface';

@CommandHandler(ForgetPasswordCommand)
export class ForgetPasswordHandler
  implements ICommandHandler<ForgetPasswordCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly mailSenderService: MailSenderService,
    private readonly httpErrorService: HttpErrorService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(ForgetPasswordHandler.name);
  }

  async execute(command: ForgetPasswordCommand): Promise<IApiResponse<null>> {
    const { forgetPasswordDto } = command;
    const { email, role } = forgetPasswordDto;

    this.logger.log(`Forget password request for ${email}`);

    if (!email) {
      throw this.httpErrorService.throwError(
        ErrorTypes.NotFound,
        ErrorResponseMessages.EMAIL_REQUIRED,
      );
    }

    const user = await this.userRepository.findOne({ email: email });
    if (!user) {
      throw this.httpErrorService.throwError(
        ErrorTypes.NotFound,
        ErrorResponseMessages.USER_NOT_FOUND,
      );
    }

    // Generate reset token
    const resetToken = this.jwtTokenService.generatePasswordResetToken({
      sub: user.id.toString(),
      email: user.email,
    });
    const expireIn = 7 * 24 * 60 * 60 * 1000; // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 ms

    await this.userRepository.updateById(user.id, {
      token: resetToken,
      tokenExpire: new Date().getTime() + expireIn,
    });

    // Send verification email
    const config = RoleConfigUrlMap[role] || RoleConfigUrlMap.default;
    const resetUrl = `${this.configService.get<string>(config.urlKey)}/reset-password?token=${resetToken}&email=${user.email}`;

    // Send email
    await this.mailSenderService.sendMailTemplate({
      templateName: TemplateEnum.FORGET_PASSWORD,
      payload: { username: user.firstName || user.email, url: resetUrl },
      to: user.email,
      subject: 'Password Reset Request',
      provider: MailProvider.GMAIL,
    });

    return {
      status: 'success',
      statusCode: 200,
      message: SuccessResponseMessages.USER_VERIFIED_SUCCESSFULLY,
      data: null,
    };
  }
}
