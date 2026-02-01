import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { PokemonRepository } from './repositories/pokemon.repository';

import { PokeApiRepository } from './repositories/poke-api.repository';

@Module({
  imports: [],
  controllers: [PokemonController],

  providers: [
    PokemonService,
    {
      provide: PokemonRepository,
      useClass: PokeApiRepository,
    },
  ],
})
export class PokemonModule {}
