import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available everywhere
    }),
    CacheModule.register({
      isGlobal: true, // Use memory cache globally
      ttl: 60 * 60 * 1000, // 1 hour default TTL (in ms for newer versions, check doc if issues)
      max: 100, // Max number of items in cache
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per TTL
      },
    ]),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
