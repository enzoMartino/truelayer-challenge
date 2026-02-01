import {
  findEnglishDescription,
  cleanDescription,
  getHabitat,
} from './poke-api.utils';

describe('PokeApiUtils', () => {
  describe('findEnglishDescription', () => {
    it('should return English description if present', () => {
      const entries = [
        {
          flavor_text: 'Hola mundo',
          language: { name: 'es', url: 'http://es' },
        },
        {
          flavor_text: 'Hello world',
          language: { name: 'en', url: 'http://en' },
        },
      ];
      expect(findEnglishDescription(entries)).toBe('Hello world');
    });

    it('should return undefined if English description is missing', () => {
      const entries = [
        {
          flavor_text: 'Hola mundo',
          language: { name: 'es', url: 'http://es' },
        },
      ];
      expect(findEnglishDescription(entries)).toBeUndefined();
    });

    it('should return undefined if entries list is empty or invalid', () => {
      expect(findEnglishDescription([])).toBeUndefined();
      // @ts-expect-error Testing runtime safety for null input
      expect(findEnglishDescription(null)).toBeUndefined();
    });
  });

  describe('cleanDescription', () => {
    it('should remove newlines, tabs, and form feeds', () => {
      const dirty = 'Hello\nWorld\tThis is\rtesting\fcleaning.';
      const clean = 'Hello World This is testing cleaning.';
      expect(cleanDescription(dirty)).toBe(clean);
    });

    it('should return default message if description is empty or undefined', () => {
      expect(cleanDescription(undefined)).toBe('No description available.');
      expect(cleanDescription('')).toBe('No description available.');
    });

    it('should return original string if no special characters present', () => {
      const clean = 'Assign simple text.';
      expect(cleanDescription(clean)).toBe(clean);
    });
  });

  describe('getHabitat', () => {
    it('should return habitat name if habitat is present', () => {
      const habitat = { name: 'cave', url: 'http://test' };
      expect(getHabitat(habitat)).toBe('cave');
    });

    it("should return 'unknown' if habitat is null", () => {
      expect(getHabitat(null)).toBe('unknown');
    });
  });
});
