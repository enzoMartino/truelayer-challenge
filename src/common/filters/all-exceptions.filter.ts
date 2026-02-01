import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiErrorResponse } from '../interfaces/api-error-response.interface';
import { ClsService } from 'nestjs-cls';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly cls: ClsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Extract message from NestJS exception response (which can be string or object)
    let message: string;
    let error: string | undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as {
        message?: string | string[];
        error?: string;
      };
      // Handle standard NestJS error object { statusCode, message, error }
      if (Array.isArray(responseObj.message)) {
        message = responseObj.message.join(', '); // Class-validator errors are arrays
      } else {
        message = responseObj.message || 'Unknown error';
      }
      error = responseObj.error;
    } else {
      message = String(exceptionResponse);
    }

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Internal Server Error: ${message}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    const responseBody: ApiErrorResponse = {
      statusCode: httpStatus,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      traceId: this.cls.getId(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
