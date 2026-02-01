import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ClsService } from 'nestjs-cls';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const httpAdapter = app.get(HttpAdapterHost);
  const clsService = app.get(ClsService);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, clsService));

  // Enable Versioning (v1/endpoint)
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Security Headers
  app.use(helmet());

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not in the DTO
      transform: true, // auto-transform payloads to DTO instances
    }),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Shakespearean Pokemon API')
    .setDescription('TrueLayer Engineering Challenge')
    .setVersion('1.0')
    .addTag('pokemon')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
