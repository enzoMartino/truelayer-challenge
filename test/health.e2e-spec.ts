import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET) should return 200/503 status', () => {
    // We check for 200 OK or 503 SERVICE UNAVAILABLE because external dependencies (PokeAPI/FunTranslations)
    // might be flaky or rate-limited during tests, which is a valid "Service Unavailable" health state.
    // We mainly want to ensure the endpoint itself is reachable and executing the check logic.
    return request(app.getHttpServer())
      .get('/health')
      .expect((res) => {
        if (res.status !== 200 && res.status !== 503) {
          throw new Error(
            `Expected Success (200) or Service Unavailable (503), got ${res.status}`,
          );
        }
      });
  });
});
