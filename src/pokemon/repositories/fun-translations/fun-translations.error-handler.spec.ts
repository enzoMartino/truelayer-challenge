import { Logger } from '@nestjs/common';
import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { handleFunTranslationsError } from './fun-translations.error-handler';

describe('handleFunTranslationsError', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    jest.spyOn(logger, 'error').mockImplementation();
    jest.spyOn(logger, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log warn on 429 Rate Limit', () => {
    const error = new AxiosError();
    error.response = {
      status: 429,
      statusText: 'Too Many Requests',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse;

    try {
      handleFunTranslationsError(error, 'yoda', logger);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("rate limit exceeded for strategy 'yoda'"),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should log error on other Axios errors', () => {
    const error = new AxiosError('Network Error');

    try {
      handleFunTranslationsError(error, 'shakespeare', logger);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "API error for strategy 'shakespeare': Network Error",
      ),
      expect.anything(),
    );
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should log error on generic errors', () => {
    const error = new Error('Unexpected crash');

    try {
      handleFunTranslationsError(error, 'yoda', logger);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Unexpected error in FunTranslationsRepository'),
      expect.anything(),
    );
  });
});
