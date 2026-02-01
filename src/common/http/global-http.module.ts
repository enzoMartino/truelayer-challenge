import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AxiosLoggingInterceptor } from './axios-logging.interceptor';

@Global() // Make it global so we don't need to import it everywhere
@Module({
  imports: [HttpModule],
  providers: [AxiosLoggingInterceptor],
  exports: [HttpModule],
})
export class GlobalHttpModule {}
