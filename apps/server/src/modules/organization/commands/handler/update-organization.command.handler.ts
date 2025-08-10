// src/modules/organization/handlers/update-org.handler.ts
import {
  IApiResponse,
  ErrorResponseMessages,
  ErrorTypes,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { HttpException } from '@nestjs/common';
import { LoggerService } from 'services/logger-service/index.service';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { OrganizationResponseDto } from '../../dto/response-organization.dto';
import { OrganizationRepository } from '../../repository/organization.repository';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationCommand } from '../impl/update-organization.command';
import { UpdateUserCommand } from 'src/modules/users/commands/impl/update-user.command';


@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationHandler
  implements ICommandHandler<UpdateOrganizationCommand>
{
  constructor(
    private readonly orgRepository: OrganizationRepository,
    private readonly errorService: HttpErrorService,
    private readonly logger: LoggerService,
    private readonly commandBus: CommandBus,
  ) {
    this.logger.setContext('UpdateOrgHandler');
  }

  async execute(
    command: UpdateOrganizationCommand,
  ): Promise<IApiResponse<OrganizationResponseDto>> {
    const { id, updateOrganizationDto } = command;

    try {
      this.logger.log(`Initiating update for organization: ${id}`);

      // Fetch existing organization
      const org = await this.orgRepository.findById(id);
      if (!org) {
        throw this.errorService.throwError(
          ErrorTypes.NotFound,
          ErrorResponseMessages.ORGANIZATION_NOT_FOUND,
        );
      }

      // Prepare update data
      const orgUpdateData = this.buildUpdateData(org, updateOrganizationDto);

      // Perform organization update
      const updatedOrg = await this.orgRepository.updateById(id, orgUpdateData);
      if (!updatedOrg) {
        throw this.errorService.throwError(
          ErrorTypes.InternalServerError,
          ErrorResponseMessages.ORGANIZATION_UPDATE_FAILED,
        );
      }

      // Update associated user if necessary
      await this.handleUserUpdate(
        org.ownerId.toString(),
        updateOrganizationDto,
        org,
      );

      this.logger.log(`Organization updated: ${updatedOrg.name}`);

      return {
        status: 'success',
        statusCode: 200,
        message: SuccessResponseMessages.ORGANIZATION_UPDATED_SUCCESSFULLY,
        data: new OrganizationResponseDto(updatedOrg),
        error: null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update organization ${id}`,
        error.stack || error.message,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw this.errorService.throwError(
        ErrorTypes.InternalServerError,
        error.message || ErrorResponseMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildUpdateData(org: any, updateOrganizationDto: any): any {
    const updateData: any = {
      name: updateOrganizationDto.name ?? org.name,
      description: updateOrganizationDto.description ?? org.description,
      logo: updateOrganizationDto.logo ?? org.logo,
      address: {
        street:
          updateOrganizationDto.address?.street ?? org.address?.street ?? '',
        city: updateOrganizationDto.address?.city ?? org.address?.city ?? '',
        state: updateOrganizationDto.address?.state ?? org.address?.state ?? '',
        postalCode:
          updateOrganizationDto.address?.postalCode ??
          org.address?.postalCode ??
          '',
        country:
          updateOrganizationDto.address?.country ?? org.address?.country ?? '',
      },
    };

    // Add owner fields only if provided
    if (updateOrganizationDto.ownerFirstName)
      updateData.ownerFirstName = updateOrganizationDto.ownerFirstName;
    if (updateOrganizationDto.ownerLastName)
      updateData.ownerLastName = updateOrganizationDto.ownerLastName;
    if (updateOrganizationDto.email)
      updateData.email = updateOrganizationDto.email;

    return updateData;
  }

  private async handleUserUpdate(
    ownerId: string,
    updateOrganizationDto: any,
    org: any,
  ): Promise<void> {
    const needsUserUpdate =
      updateOrganizationDto.ownerFirstName ||
      updateOrganizationDto.ownerLastName ||
      updateOrganizationDto.email;
    if (needsUserUpdate) {
      await this.commandBus.execute(
        new UpdateUserCommand(ownerId, {
          firstName: updateOrganizationDto.ownerFirstName ?? org.ownerFirstName,
          lastName: updateOrganizationDto.ownerLastName ?? org.ownerLastName,
          email: updateOrganizationDto.email ?? org.email,
        }),
      );
    }
  }
}
