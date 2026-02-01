import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PokemonRepository } from './pokemon.repository';
import { Pokemon } from '../entities/pokemon.entity';
import {
  findEnglishDescription,
  cleanDescription,
  getHabitat,
} from './poke-api.utils';
import { handlePokeApiError } from './poke-api.error-handler';
import { PokeApiSpeciesResponse } from './poke-api.types';

@Injectable()
export class PokeApiRepository implements PokemonRepository {
  private readonly logger = new Logger(PokeApiRepository.name);
  private readonly pokeApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pokeApiUrl = this.configService.get<string>(
      'POKEMON_API_URL',
      'https://pokeapi.co/api/v2/pokemon-species',
    );
  }

  async getPokemon(name: string): Promise<Pokemon> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<PokeApiSpeciesResponse>(
          `${this.pokeApiUrl}/${name.toLowerCase()}`,
        ),
      );

      const description = findEnglishDescription(data.flavor_text_entries);
      const cleanDesc = cleanDescription(description);
      const habitat = getHabitat(data.habitat);

      return {
        name: data.name,
        description: cleanDesc,
        habitat,
        isLegendary: data.is_legendary,
      };
    } catch (error) {
      return handlePokeApiError(error, name, this.logger);
    }
  }
}
