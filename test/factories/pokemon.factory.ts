import { Pokemon } from '../../src/pokemon/entities/pokemon.entity';

export const createPokemon = (overrides?: Partial<Pokemon>): Pokemon => {
  return {
    name: 'charizard',
    description: 'Spits fire that is hot enough to melt boulders.',
    habitat: 'mountain',
    isLegendary: false,
    ...overrides,
  };
};
