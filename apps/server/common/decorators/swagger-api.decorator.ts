// common/decorators/api-dto.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';

interface ApiDtoOptions {
  body?: Type<any>;
  query?: { name: string; type: Type<any>; required?: boolean; description?: string; example?: any }[];
  params?: { name: string; type: Type<any>; required?: boolean; description?: string; example?: any }[];
  response?: Type<any> | Type<any>[];
  statusCode?: number;
  description?: string;
}

export function ApiDto(options: ApiDtoOptions) {
  const decorators: Array<MethodDecorator | ClassDecorator> = [];

  if (options.body) {
    decorators.push(ApiBody({ type: options.body }));
  }

  if (options.query) {
    options.query.forEach(({ name, type, required = false, description, example }) => {
      decorators.push(ApiQuery({ name, type, required, description, example }));
    });
  }

  if (options.params) {
    options.params.forEach(({ name, type, required = true, description, example }) => {
      decorators.push(ApiParam({ name, type, required, description, example }));
    });
  }

  if (options.response) {
    decorators.push(
      ApiResponse({
        status: options.statusCode ?? 200,
        description: options.description ?? 'Successful response',
        isArray: Array.isArray(options.response),
      }),
    );
  }

  // Return no-op decorator if no decorators present, else spread decorators with proper typing
  if (decorators.length === 0) {
    return () => {};
  }

  return applyDecorators(...decorators);
}
