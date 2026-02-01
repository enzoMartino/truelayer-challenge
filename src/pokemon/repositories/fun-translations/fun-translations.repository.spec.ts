import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { FunTranslationsRepository } from './fun-translations.repository';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

describe('FunTranslationsRepository', () => {
  let repository: FunTranslationsRepository;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunTranslationsRepository,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    repository = module.get<FunTranslationsRepository>(
      FunTranslationsRepository,
    );
    httpService = module.get<HttpService>(HttpService);
  });

  it('should return translated text on success', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        success: { total: 1 },
        contents: {
          translated: 'Translated text',
          text: 'Original text',
          translation: 'yoda',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig,
    };

    mockHttpService.post.mockReturnValue(of(mockResponse));

    const result = await repository.translate('Original text', 'yoda');
    expect(result).toBe('Translated text');
    expect(httpService.post).toHaveBeenCalledWith(
      expect.stringContaining('/yoda.json'),
      { text: 'Original text' },
    );
  });

  it('should throw error on failure', async () => {
    mockHttpService.post.mockReturnValue(
      throwError(() => new Error('API Error')),
    );

    await expect(
      repository.translate('Original text', 'shakespeare'),
    ).rejects.toThrow('API Error');
  });
});
