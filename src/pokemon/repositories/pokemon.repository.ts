import { Pokemon } from '../entities/pokemon.entity';

export abstract class PokemonRepository {
  abstract getPokemon(name: string): Promise<Pokemon>;
}
