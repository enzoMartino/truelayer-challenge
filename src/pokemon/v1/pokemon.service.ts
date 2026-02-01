import { Injectable, Logger } from '@nestjs/common';
import { Pokemon } from '@/pokemon/entities/pokemon.entity';
import { PokemonRepository } from '@/pokemon/repositories/pokemon.repository';
import { TranslationRepository } from '@/pokemon/repositories/translation.repository';
import { getTranslationStrategy } from '@/pokemon/utils/translation.utils';

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);

  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly translationRepository: TranslationRepository,
  ) {}

  async getPokemon(name: string): Promise<Pokemon> {
    return this.pokemonRepository.getPokemon(name);
  }

  async getTranslatedPokemon(name: string): Promise<Pokemon> {
    const pokemon = await this.getPokemon(name);
    const strategy = getTranslationStrategy(pokemon);

    try {
      const translatedDescription = await this.translationRepository.translate(
        pokemon.description,
        strategy,
      );
      return { ...pokemon, description: translatedDescription };
    } catch (error) {
      this.logger.warn(
        `Translation failed for ${name} (${strategy}). Falling back to original description. Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return pokemon;
    }
  }
}
