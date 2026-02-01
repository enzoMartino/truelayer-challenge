import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API status and dependencies' })
  check() {
    return this.health.check([
      // Increased to 300MB to accommodate test runner overhead
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      // Use the actual API root which responds well to pings
      () => this.http.pingCheck('pokeapi', 'https://pokeapi.co/api/v2/'),
      // Check if FunTranslations is up
      () =>
        this.http.pingCheck(
          'funtranslations',
          'https://api.funtranslations.com',
        ),
    ]);
  }
}
