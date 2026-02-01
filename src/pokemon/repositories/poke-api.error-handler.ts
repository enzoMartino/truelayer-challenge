import {
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosError } from 'axios';

export const handlePokeApiError = (
  error: unknown,
  name: string,
  logger: Logger,
): never => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 404) {
      throw new NotFoundException(`Pokemon '${name}' not found`);
    }
    logger.error(
      `Error fetching data from PokeAPI: ${error.message}`,
      error.stack,
    );
  }
  throw new InternalServerErrorException('Failed to fetch Pokemon information');
};
