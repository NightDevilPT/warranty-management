// src/common/errors/error.service.ts
import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  PayloadTooLargeException,
  NotImplementedException,
  UnprocessableEntityException,
} from '@nestjs/common';

export interface ErrorOptions {
  description?: string;
  cause?: Error;
}

@Injectable()
export class ErrorService {
  // 400 Bad Request
  badRequest(message?: string, options?: ErrorOptions): BadRequestException {
    return new BadRequestException(message, options);
  }

  // 401 Unauthorized
  unauthorized(
    message?: string,
    options?: ErrorOptions,
  ): UnauthorizedException {
    return new UnauthorizedException(message, options);
  }

  // 403 Forbidden
  forbidden(message?: string, options?: ErrorOptions): ForbiddenException {
    return new ForbiddenException(message, options);
  }

  // 404 Not Found
  notFound(message?: string, options?: ErrorOptions): NotFoundException {
    return new NotFoundException(message, options);
  }

  // 409 Conflict
  conflict(message?: string, options?: ErrorOptions): ConflictException {
    return new ConflictException(message, options);
  }

  // 422 Unprocessable Entity
  unprocessableEntity(
    message?: string,
    options?: ErrorOptions,
  ): UnprocessableEntityException {
    return new UnprocessableEntityException(message, options);
  }

  // 500 Internal Server Error
  internalServerError(
    message?: string,
    options?: ErrorOptions,
  ): InternalServerErrorException {
    return new InternalServerErrorException(message, options);
  }

  // 503 Service Unavailable
  serviceUnavailable(
    message?: string,
    options?: ErrorOptions,
  ): ServiceUnavailableException {
    return new ServiceUnavailableException(message, options);
  }

  // 504 Gateway Timeout
  gatewayTimeout(
    message?: string,
    options?: ErrorOptions,
  ): GatewayTimeoutException {
    return new GatewayTimeoutException(message, options);
  }

  // 413 Payload Too Large
  payloadTooLarge(
    message?: string,
    options?: ErrorOptions,
  ): PayloadTooLargeException {
    return new PayloadTooLargeException(message, options);
  }

  // 501 Not Implemented
  notImplemented(
    message?: string,
    options?: ErrorOptions,
  ): NotImplementedException {
    return new NotImplementedException(message, options);
  }
}
