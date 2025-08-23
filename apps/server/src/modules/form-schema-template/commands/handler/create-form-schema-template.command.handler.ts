// src/modules/form-schema-template/commands/handler/create-form-schema-template.command.handler.ts

import {
  IApiResponse,
  ErrorResponseMessages,
  ErrorTypes,
  SuccessResponseMessages,
} from 'interfaces/api-response.interface';
import { Types } from 'mongoose';
import { HttpException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ROLES } from 'src/modules/users/interface/user.interface';
import { LoggerService } from 'services/logger-service/index.service';
import { FormSchemaCategory } from 'interfaces/form-schema.interface';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { UserRepository } from 'src/modules/users/repository/user.repository';
import { FormSchemaTemplateResponseDto } from '../../dto/response-form-schema-template.dto';
import { FormSchemaTemplateRepository } from '../../repository/form-schema-template.repository';
import { OrganizationRepository } from 'src/modules/organization/repository/organization.repository';
import { CreateFormSchemaTemplateCommand } from '../impl/create-form-schema-template.command';

@CommandHandler(CreateFormSchemaTemplateCommand)
export class CreateFormSchemaTemplateHandler
  implements ICommandHandler<CreateFormSchemaTemplateCommand>
{
  constructor(
    private readonly formSchemaTemplateRepository: FormSchemaTemplateRepository,
    private readonly orgRepository: OrganizationRepository,
    private readonly userRepository: UserRepository,
    private readonly httpErrorService: HttpErrorService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreateFormSchemaTemplateHandler.name);
  }

  async execute(
    command: CreateFormSchemaTemplateCommand,
  ): Promise<IApiResponse<FormSchemaTemplateResponseDto>> {
    const { createFormSchemaTemplateDto, userId } = command;

    try {
      this.logger.log(`Received command from user: ${userId}`);

      // Validate Organization
      const organizationId = new Types.ObjectId(
        createFormSchemaTemplateDto.rootOrganizationId,
      );
      await this.validateOrganization(
        organizationId,
        createFormSchemaTemplateDto.rootOrganizationId.toString(),
      );

      // Validate User Access
      const user = await this.validateUser(userId);
      this.ensureUserAccess(
        userId,
        user,
        createFormSchemaTemplateDto.rootOrganizationId.toString(),
      );

      // Ensure Template Uniqueness
      await this.ensureTemplateUniqueness(
        createFormSchemaTemplateDto.category,
        organizationId,
        createFormSchemaTemplateDto.title,
      );

      // Prepare Template Data
      const templateData = this.prepareTemplateData(
        createFormSchemaTemplateDto,
        organizationId,
      );

      // Create Form Schema Template
      const formSchemaTemplate =
        await this.formSchemaTemplateRepository.create(templateData);

      if (!formSchemaTemplate) {
        this.logger.error(
          `Failed to create form schema template for org ${createFormSchemaTemplateDto.rootOrganizationId}`,
        );
        throw this.httpErrorService.throwError(
          ErrorTypes.InternalServerError,
          ErrorResponseMessages.FORM_TEMPLATE_CREATION_FAILED,
        );
      }

      this.logger.log(
        `Form schema template created successfully with ID: ${formSchemaTemplate._id}`,
      );

      return {
        status: 'success',
        statusCode: 201,
        message: SuccessResponseMessages.FORM_TEMPLATE_CREATED_SUCCESSFULLY,
        data: new FormSchemaTemplateResponseDto(formSchemaTemplate),
        error: null,
      };
    } catch (error) {
      this.logger.error(
        'Error during form schema template creation',
        error.stack || error.message,
      );

      if (error instanceof HttpException) throw error;

      throw this.httpErrorService.throwError(
        ErrorTypes.InternalServerError,
        error.message || ErrorResponseMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ------------------ Private Helpers ------------------ //

  private async validateOrganization(
    organizationId: Types.ObjectId,
    rawOrgId: string,
  ) {
    const organization = await this.orgRepository.findById(organizationId);
    if (!organization) {
      this.logger.warn(`Organization with ID ${rawOrgId} not found`);
      throw this.httpErrorService.throwError(
        ErrorTypes.NotFound,
        ErrorResponseMessages.ORGANIZATION_NOT_FOUND,
      );
    }
    return organization;
  }

  private async validateUser(userId: string) {
    const user = await this.userRepository.findById(new Types.ObjectId(userId));
    if (!user) {
      this.logger.warn(`User ${userId} not found`);
      throw this.httpErrorService.throwError(
        ErrorTypes.NotFound,
        ErrorResponseMessages.USER_NOT_FOUND,
      );
    }
    return user;
  }

  private ensureUserAccess(
    userId: string,
    user: any,
    rootOrganizationId: string,
  ) {
    const hasAdminRole = user.roles?.some((item) => item.role === ROLES.ADMIN);

    const hasOrgSuperAdminRole = user.roles?.some(
      (item) =>
        item.organizationId.toString() === rootOrganizationId.toString() &&
        item.role === ROLES.COMPANY_SUPER_ADMIN,
    );

    if (!hasAdminRole && !hasOrgSuperAdminRole) {
      this.logger.warn(
        `User ${userId} does not have access to organization ${rootOrganizationId}`,
      );
      throw this.httpErrorService.throwError(
        ErrorTypes.Forbidden,
        ErrorResponseMessages.YOU_DO_NOT_HAVE_ACCESS_TO_THIS_ORGANIZATION,
      );
    }
  }

  private async ensureTemplateUniqueness(
    category: FormSchemaCategory,
    organizationId: Types.ObjectId,
    title: string,
  ) {
    const existingTemplate =
      await this.formSchemaTemplateRepository.findFormSchemaByCategory(
        category,
        organizationId,
      );

    if (existingTemplate) {
      this.logger.warn(
        `Template with title "${title}" already exists for organization ${organizationId}`,
      );
      throw this.httpErrorService.throwError(
        ErrorTypes.BadRequest,
        ErrorResponseMessages.FORM_TEMPLATE_ALREADY_EXISTS,
      );
    }
  }

  private prepareTemplateData(dto: any, organizationId: Types.ObjectId) {
    return {
      ...dto,
      rootOrganizationId: organizationId,
      fields: dto.fields.map((field) => ({
        ...field,
        placeholder: field.placeholder ?? '',
        description: field.description ?? '',
        options: field.options ?? [],
        validation: field.validation ?? {},
        isHidden: field.isHidden ?? false,
        isDisabled: field.isDisabled ?? false,
        dependsOn: field.dependsOn ?? [],
        order: field.order ?? 0,
      })),
    };
  }
}
