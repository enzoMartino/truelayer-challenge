import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockHttpHealthIndicator = {
    pingCheck: jest.fn(),
  };

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: HttpHealthIndicator,
          useValue: mockHttpHealthIndicator,
        },
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemoryHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
