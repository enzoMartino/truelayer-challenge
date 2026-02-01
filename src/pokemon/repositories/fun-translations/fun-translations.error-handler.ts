import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

export const handleFunTranslationsError = (
  error: unknown,
  strategy: string,
  logger: Logger,
): never => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 429) {
      logger.warn(
        `FunTranslations API rate limit exceeded for strategy '${strategy}'.`,
      );
    } else {
      logger.error(
        `FunTranslations API error for strategy '${strategy}': ${error.message}`,
        error.stack,
      );
    }
  } else {
    logger.error(
      `Unexpected error in FunTranslationsRepository for strategy '${strategy}': ${
        error instanceof Error ? error.message : String(error)
      }`,
      error instanceof Error && 'stack' in error ? error.stack : undefined,
    );
  }
  // We always re-throw because the Service layer handles fallbacks.
  // This utility is primarily for consistent logging of WHY it failed before re-throwing.
  throw error;
};
