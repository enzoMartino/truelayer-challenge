import {
  getTranslationStrategy,
  isCavePokemon,
  isLegendaryPokemon,
} from './translation.utils';
import { createPokemon } from '../../../test/factories/pokemon.factory';

describe('Translation Utils', () => {
  describe('isCavePokemon', () => {
    it('should return true if habitat is cave', () => {
      expect(isCavePokemon(createPokemon({ habitat: 'cave' }))).toBe(true);
    });

    it('should return false if habitat is not cave', () => {
      expect(isCavePokemon(createPokemon({ habitat: 'forest' }))).toBe(false);
    });
  });

  describe('isLegendaryPokemon', () => {
    it('should return true if pokemon is legendary', () => {
      expect(isLegendaryPokemon(createPokemon({ isLegendary: true }))).toBe(
        true,
      );
    });

    it('should return false if pokemon is not legendary', () => {
      expect(isLegendaryPokemon(createPokemon({ isLegendary: false }))).toBe(
        false,
      );
    });
  });

  describe('getTranslationStrategy', () => {
    it('should return "yoda" if pokemon is legendary', () => {
      const pokemon = createPokemon({
        isLegendary: true,
        habitat: 'forest',
      });
      expect(getTranslationStrategy(pokemon)).toBe('yoda');
    });

    it('should return "yoda" if pokemon lives in a cave', () => {
      const pokemon = createPokemon({
        isLegendary: false,
        habitat: 'cave',
      });
      expect(getTranslationStrategy(pokemon)).toBe('yoda');
    });

    it('should return "yoda" if pokemon is legendary AND lives in a cave', () => {
      const pokemon = createPokemon({ isLegendary: true, habitat: 'cave' });
      expect(getTranslationStrategy(pokemon)).toBe('yoda');
    });

    it('should return "shakespeare" if pokemon is neither legendary nor lives in a cave', () => {
      const pokemon = createPokemon({
        isLegendary: false,
        habitat: 'forest',
      });
      expect(getTranslationStrategy(pokemon)).toBe('shakespeare');
    });
  });
});
