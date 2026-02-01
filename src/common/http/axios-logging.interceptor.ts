import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClsService } from 'nestjs-cls';

import { InternalAxiosRequestConfig } from 'axios';

@Injectable()
export class AxiosLoggingInterceptor implements OnModuleInit {
  private readonly logger = new Logger(AxiosLoggingInterceptor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly cls: ClsService,
  ) {}

  onModuleInit() {
    const axios = this.httpService.axiosRef;

    axios.interceptors.request.use((config) => {
      const traceId = this.cls.getId();
      if (traceId) {
        config.headers['x-trace-id'] = traceId;
      }

      this.logger.debug({
        message: `[Request] ${config.method?.toUpperCase()} ${config.url}`,
        body: config.data,
      });

      // Attach start time for duration calculation
      (config as InternalAxiosRequestConfig).metadata = {
        startTime: new Date(),
      };

      return config;
    });

    axios.interceptors.response.use(
      (response) => {
        const { config } = response;
        const startTime = (config as InternalAxiosRequestConfig).metadata
          ?.startTime;
        const duration = startTime ? Date.now() - startTime.getTime() : 0;

        this.logger.debug({
          message: `[Response] ${response.status} ${config.method?.toUpperCase()} ${config.url} +${duration}ms`,
          body: response.data,
        });
        return response;
      },
      (error) => {
        const { config, response } = error;
        const startTime = (config as InternalAxiosRequestConfig)?.metadata
          ?.startTime;
        const duration = startTime ? Date.now() - startTime.getTime() : 0;

        if (response) {
          this.logger.error({
            message: `[Response Error] ${response.status} ${config?.method?.toUpperCase()} ${config?.url} +${duration}ms`,
            body: response.data,
          });
        } else {
          this.logger.error(
            `[Request Error] ${error.message} ${config?.method?.toUpperCase()} ${config?.url}`,
          );
        }
        return Promise.reject(error);
      },
    );
  }
}
