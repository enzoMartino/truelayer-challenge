import { Module, Global, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AxiosLoggingInterceptor } from './axios-logging.interceptor';
import axiosRetry from 'axios-retry';

@Global() // Make it global so we don't need to import it everywhere
@Module({
  imports: [HttpModule],
  providers: [AxiosLoggingInterceptor],
  exports: [HttpModule],
})
export class GlobalHttpModule implements OnModuleInit {
  constructor(private readonly httpService: HttpService) {}

  onModuleInit() {
    axiosRetry(this.httpService.axiosRef, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ? error.response.status >= 500 : false)
        );
      },
    });
  }
}
