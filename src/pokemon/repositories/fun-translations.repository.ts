import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TranslationRepository } from './translation.repository';
import { FunTranslationsResponse } from './fun-translations.types';
import { handleFunTranslationsError } from './fun-translations.error-handler';

@Injectable()
export class FunTranslationsRepository implements TranslationRepository {
  private readonly logger = new Logger(FunTranslationsRepository.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'FUN_TRANSLATIONS_API_URL',
      'https://api.funtranslations.com/translate',
    );
  }

  async translate(
    text: string,
    strategy: 'yoda' | 'shakespeare',
  ): Promise<string> {
    const url = `${this.baseUrl}/${strategy}.json`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<FunTranslationsResponse>(url, {
          text,
        }),
      );
      return data.contents.translated;
    } catch (error) {
      handleFunTranslationsError(error, strategy, this.logger);
      throw error; // Typscript needs to know we throw, even if the handler returns never (which it does, but TS might miss it if not explicit in the call signature in this context or just to be safe)
    }
  }
}
