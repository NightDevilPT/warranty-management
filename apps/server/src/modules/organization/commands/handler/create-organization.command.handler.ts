import {
  IApiResponse,
  ErrorResponseMessages,
  ErrorTypes,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { HttpException } from '@nestjs/common';
import { UserRoles } from 'src/modules/users/entities/user.entity';
import { ROLES } from 'src/modules/users/interface/user.interface';
import { LoggerService } from 'services/logger-service/index.service';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { UserRepository } from 'src/modules/users/repository/user.repository';
import { OrganizationResponseDto } from '../../dto/response-organization.dto';
import { OrganizationRepository } from '../../repository/organization.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from '../impl/create-organization.command';
import { CreateUserCommand } from 'src/modules/users/commands/impl/create-user.command';


@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler
  implements ICommandHandler<CreateOrganizationCommand>
{
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly userRepository: UserRepository,
    private readonly httpErrorService: HttpErrorService,
    private readonly loggerService: LoggerService,
    private readonly commandBus: CommandBus,
  ) {
    this.loggerService.setContext('CreateOrganizationHandler');
  }

  async execute(
    command: CreateOrganizationCommand,
  ): Promise<IApiResponse<OrganizationResponseDto>> {
    const { createOrganizationDto } = command;

    try {
      this.loggerService.log(
        `Start creating organization: ${createOrganizationDto.name}`,
      );

      // ----- Create user for organization owner -----
      const createUser = await this.commandBus.execute(
        new CreateUserCommand({
          firstName: createOrganizationDto.ownerFirstName,
          lastName: createOrganizationDto.ownerLastName,
          email: createOrganizationDto.email,
          contact: createOrganizationDto.phone,
          role: ROLES.COMPANY_SUPER_ADMIN,
          password: createOrganizationDto.password,
        }),
      );

      // ----- Check if user creation was successful -----
      if (createUser.statusCode !== 201) {
        this.loggerService.error(`Error creating user: ${createUser.message}`);
        throw this.httpErrorService.throwError(
          ErrorTypes.BadRequest,
          ErrorResponseMessages.USER_CREATION_FAILED,
        );
      }
      this.loggerService.log(
        `User created successfully with email: ${createOrganizationDto.email}`,
      );

      // ----- Creating organization -----
      const createOrganization = await this.organizationRepository.create({
        name: createOrganizationDto.name,
        slug: createOrganizationDto.slug,
        ownerFirstName: createOrganizationDto.ownerFirstName,
        ownerLastName: createOrganizationDto.ownerLastName,
        email: createOrganizationDto.email,
        phone: createOrganizationDto.phone,
        logo: createOrganizationDto.logo || '',
        rootOrganizationId: null, // Assuming root organization is null for new organizations
        ownerId: createUser.data._id || createUser?.data.id, // Use the created user's ID as the owner
        address: createOrganizationDto.address
          ? {
              street: createOrganizationDto.address.street || '',
              city: createOrganizationDto.address.city || '',
              state: createOrganizationDto.address.state || '',
              postalCode: createOrganizationDto.address.postalCode || '',
              country: createOrganizationDto.address.country || '',
            }
          : null,
      });

      // ----- Check if organization creation was successful -----
      if (!createOrganization) {
        this.loggerService.error(
          `Error creating organization: ${createOrganizationDto.name}`,
        );
        throw this.httpErrorService.throwError(
          ErrorTypes.BadRequest,
          ErrorResponseMessages.ORGANIZATION_CREATION_FAILED,
        );
      }
      this.loggerService.log(
        `Organization created successfully: ${createOrganization.name}`,
      );

      // ----- Assign Company Super Admin role to the user -----
      const createSuperAdminRules: UserRoles = {
        organizationId: createOrganization._id || createOrganization.id,
        rootOrganizationId: createUser.data._id || createUser?.data.id,
        role: ROLES.COMPANY_SUPER_ADMIN,
      };

      await this.userRepository.updateById(
        createUser.data._id || createUser?.data.id,
        { $push: { roles: createSuperAdminRules } },
      );

      return {
        status: 'success',
        statusCode: 201,
        message: SuccessResponseMessages.ORGANIZATION_CREATED_SUCCESSFULLY,
        data: new OrganizationResponseDto(createOrganization),
        error: null,
      };
    } catch (error) {
      this.loggerService.error(
        'Error during user creation',
        error.stack || error.message,
      );

      // Rethrow known HTTP exceptions to be handled by NestJS
      if (error instanceof HttpException) {
        throw error;
      }

      // Wrap any unexpected errors as InternalServerError
      throw this.httpErrorService.throwError(
        ErrorTypes.InternalServerError,
        error.message || ErrorResponseMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
