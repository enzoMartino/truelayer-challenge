import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('infrastructure')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check / Welcome message' })
  @ApiResponse({ status: 200, description: 'Returns a welcome message.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
