import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import {
  HttpStatus,
  ArgumentsHost,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let httpAdapterHost: HttpAdapterHost;
  let httpAdapter: { reply: jest.Mock; getRequestUrl: jest.Mock };

  beforeEach(async () => {
    httpAdapter = {
      reply: jest.fn(),
      getRequestUrl: jest.fn().mockReturnValue('/test-url'),
    };

    httpAdapterHost = {
      httpAdapter,
    } as unknown as HttpAdapterHost;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: HttpAdapterHost,
          useValue: httpAdapterHost,
        },
        {
          provide: ClsService,
          useValue: { getId: jest.fn().mockReturnValue('test-trace-id') },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockArgumentsHost = () => {
    const getRequest = jest.fn();
    const getResponse = jest.fn().mockReturnValue({});
    return {
      switchToHttp: () => ({
        getRequest,
        getResponse,
      }),
    } as unknown as ArgumentsHost;
  };

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return proper structure', () => {
    const host = mockArgumentsHost();
    const exception = new BadRequestException('Bad request message');

    filter.catch(exception, host);

    expect(httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad request message',
        path: '/test-url',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should catch generic Error and return 500', () => {
    const host = mockArgumentsHost();
    const exception = new Error('Generic error');
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    filter.catch(exception, host);

    expect(httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/test-url',
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(loggerSpy).toHaveBeenCalledWith(
      'Internal Server Error: Internal server error',
      expect.any(String),
    );
  });

  it('should handle class-validator array errors', () => {
    const host = mockArgumentsHost();
    const exceptionResponse = {
      statusCode: 400,
      message: ['name should not be empty', 'name must be string'],
      error: 'Bad Request',
    };
    const exception = new BadRequestException(exceptionResponse);

    filter.catch(exception, host);

    expect(httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'name should not be empty, name must be string',
        path: '/test-url',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should handle object errors without array message', () => {
    const host = mockArgumentsHost();
    const exceptionResponse = {
      statusCode: 400,
      message: 'Single error message',
      error: 'Bad Request',
    };
    const exception = new BadRequestException(exceptionResponse);

    filter.catch(exception, host);

    expect(httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: 'Single error message',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should default to "Unknown error" if message is missing in object response', () => {
    const host = mockArgumentsHost();
    const exceptionResponse = {
      statusCode: 400,
      // message is missing
      error: 'Bad Request',
    };
    const exception = new BadRequestException(exceptionResponse);

    filter.catch(exception, host);

    expect(httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: 'Unknown error',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should include traceId in the response', () => {
    const host = mockArgumentsHost();
    const exception = new BadRequestException('Bad request message');

    filter.catch(exception, host);

    expect(httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        traceId: 'test-trace-id',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });
});
