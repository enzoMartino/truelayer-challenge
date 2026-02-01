import { Module } from '@nestjs/common';
import { PokemonService } from './v1/pokemon.service';
import { PokemonController } from './v1/pokemon.controller';
import { PokemonRepository } from './repositories/pokemon.repository';

import { PokeApiRepository } from './repositories/poke-api.repository';
import { TranslationRepository } from './repositories/translation.repository';
import { FunTranslationsRepository } from './repositories/fun-translations.repository';

@Module({
  imports: [],
  controllers: [PokemonController],

  providers: [
    PokemonService,
    {
      provide: PokemonRepository,
      useClass: PokeApiRepository,
    },
    {
      provide: TranslationRepository,
      useClass: FunTranslationsRepository,
    },
  ],
})
export class PokemonModule {}
