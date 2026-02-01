import { Pokemon } from '../entities/pokemon.entity';

export type TranslationStrategy = 'yoda' | 'shakespeare';

export const isCavePokemon = (pokemon: Pokemon): boolean => {
  return pokemon.habitat === 'cave';
};

export const isLegendaryPokemon = (pokemon: Pokemon): boolean => {
  return pokemon.isLegendary;
};

export const getTranslationStrategy = (
  pokemon: Pokemon,
): TranslationStrategy => {
  return isCavePokemon(pokemon) || isLegendaryPokemon(pokemon)
    ? 'yoda'
    : 'shakespeare';
};
