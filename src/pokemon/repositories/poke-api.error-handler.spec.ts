import {
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { handlePokeApiError } from './poke-api.error-handler';
import { AxiosError } from 'axios';

describe('handlePokeApiError', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
    } as unknown as Logger;
  });

  it('should throw NotFoundException on 404 AxiosError', () => {
    const error = new AxiosError();
    // @ts-expect-error Mocking Axios response for testing
    error.response = { status: 404 };

    expect(() => handlePokeApiError(error, 'mew', logger)).toThrow(
      NotFoundException,
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should log error and throw InternalServerErrorException on other AxiosErrors', () => {
    const error = new AxiosError('Network Error');
    error.stack = 'stack trace';
    // @ts-expect-error Mocking Axios response for testing
    error.response = { status: 500 };

    expect(() => handlePokeApiError(error, 'mew', logger)).toThrow(
      InternalServerErrorException,
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Error fetching data from PokeAPI: Network Error',
      'stack trace',
    );
  });

  it('should throw InternalServerErrorException on generic errors', () => {
    const error = new Error('Random crash');

    expect(() => handlePokeApiError(error, 'mew', logger)).toThrow(
      InternalServerErrorException,
    );
    // Based on implementation, it only logs if it is an AxiosError?
    // Checking current implementation:
    // if (error instanceof AxiosError) { ... log ... }
    // throw Internal ...
    // So generic errors are NOT logged in current implementation logic!
    // This maintains behavior of original code but might be worth noting.
    expect(logger.error).not.toHaveBeenCalled();
  });
});
