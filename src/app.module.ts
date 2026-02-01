import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClsModule, ClsService } from 'nestjs-cls';

import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { AppController } from './app.controller';

import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { LoggerModule } from 'nestjs-pino';
import { GlobalHttpModule } from './common/http/global-http.module';

@Module({
  imports: [
    GlobalHttpModule,
    ConfigModule.forRoot({
      isGlobal: true, // Make config available everywhere
    }),

    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) =>
          (req.headers['x-request-id'] as string) ??
          (req as Request & { id?: string }).id ??
          uuidv4(),
      },
    }),

    LoggerModule.forRootAsync({
      imports: [ClsModule],
      inject: [ClsService, ConfigService],
      useFactory: (cls: ClsService, config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('LOG_LEVEL', 'info'),
          genReqId: (req: Request) =>
            (req.headers['x-request-id'] as string) || cls.getId() || uuidv4(),
          customProps: () => ({
            traceId: cls.getId(),
          }),

          transport:
            process.env.NODE_ENV !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: false,
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname', // cleaner output
                  },
                }
              : undefined,
          autoLogging: true,
          quietReqLogger: true,
        },
      }),
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
    PokemonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
