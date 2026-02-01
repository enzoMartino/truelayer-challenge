import { ApiProperty } from '@nestjs/swagger';
import { ApiErrorResponse } from '../interfaces/api-error-response.interface';

export class ApiErrorResponseDto implements ApiErrorResponse {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Error message or description',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error type',
    required: false,
  })
  error?: string;

  @ApiProperty({
    example: '2026-02-01T12:00:00.000Z',
    description: 'Timestamp of the error',
  })
  timestamp: string;

  @ApiProperty({
    example: '/v1/pokemon/charizard',
    description: 'Request path that caused the error',
  })
  path: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'Unique trace ID for the request',
  })
  traceId: string;
}
