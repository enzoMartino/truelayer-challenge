// src/common/http/axios-logging.interceptor.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosLoggingInterceptor } from './axios-logging.interceptor';
import { HttpService } from '@nestjs/axios';
import { ClsService } from 'nestjs-cls';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';

describe('AxiosLoggingInterceptor', () => {
  let interceptor: AxiosLoggingInterceptor;
  let requestCallback: (
    conf: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig;
  let responseSuccessCallback: (res: AxiosResponse) => AxiosResponse;
  let responseErrorCallback: (error: unknown) => Promise<never>;
  let loggerDebugSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  const mockAxios = {
    interceptors: {
      request: {
        use: jest.fn((cb) => {
          requestCallback = cb;
        }),
      },
      response: {
        use: jest.fn((successCb, errorCb) => {
          responseSuccessCallback = successCb;
          responseErrorCallback = errorCb;
        }),
      },
    },
  };

  const mockHttpService = {
    axiosRef: mockAxios,
  };

  const mockClsService = {
    getId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AxiosLoggingInterceptor,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();

    interceptor = module.get<AxiosLoggingInterceptor>(AxiosLoggingInterceptor);

    // Spy on logger
    const interceptorWithLogger = interceptor as unknown as { logger: Logger };
    loggerDebugSpy = jest.spyOn(interceptorWithLogger.logger, 'debug');
    loggerErrorSpy = jest.spyOn(interceptorWithLogger.logger, 'error');

    // Manually trigger init to register interceptors
    interceptor.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('Request Interceptor', () => {
    it('should add trace id header if present in cls', () => {
      mockClsService.getId.mockReturnValue('test-trace-id');
      const config = {
        headers: {} as Record<string, string>,
        method: 'get',
        url: 'test.com',
      } as unknown as InternalAxiosRequestConfig;

      requestCallback(config);

      expect(config.headers['x-trace-id']).toBe('test-trace-id');
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '[Request] GET test.com',
        }),
      );
    });

    it('should log request body', () => {
      mockClsService.getId.mockReturnValue('test-trace-id');
      const config = {
        headers: {},
        method: 'post',
        url: 'test.com',
        data: { foo: 'bar' },
      } as unknown as InternalAxiosRequestConfig;

      requestCallback(config);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { foo: 'bar' },
        }),
      );
    });
  });

  describe('Response Interceptor', () => {
    it('should log response success with duration and body', () => {
      const startTime = new Date(Date.now() - 100); // 100ms ago
      const response = {
        status: 200,
        data: { success: true },
        config: {
          method: 'get',
          url: 'test.com',
          metadata: { startTime },
        },
      } as unknown as AxiosResponse;

      responseSuccessCallback(response);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(
            /\[Response\] 200 GET test.com \+\d+ms/,
          ),
          body: { success: true },
        }),
      );
    });

    it('should log response error with body', () => {
      const startTime = new Date(Date.now() - 100);
      const error = {
        response: {
          status: 400,
          data: { error: 'Bad Request' },
        },
        config: {
          method: 'get',
          url: 'test.com',
          metadata: { startTime },
        },
      };

      // We expect the interceptor to re-throw the error
      expect(() => responseErrorCallback(error)).rejects.toEqual(error);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(
            /\[Response Error\] 400 GET test.com \+\d+ms/,
          ),
          body: { error: 'Bad Request' },
        }),
      );
    });

    it('should log request error if no response received', () => {
      const error = {
        message: 'Network Error',
        config: {
          method: 'get',
          url: 'test.com',
        },
      };

      expect(() => responseErrorCallback(error)).rejects.toEqual(error);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[Request Error\] Network Error GET test.com/),
      );
    });
  });
});
