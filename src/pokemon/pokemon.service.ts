import { Injectable } from '@nestjs/common';
import { Pokemon } from './entities/pokemon.entity';
import { PokemonRepository } from './repositories/pokemon.repository';

@Injectable()
export class PokemonService {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  async getPokemon(name: string): Promise<Pokemon> {
    return this.pokemonRepository.getPokemon(name);
  }
}
