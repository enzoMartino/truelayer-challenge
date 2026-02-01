import { PokeApiFlavorTextEntry, PokeApiHabitat } from './poke-api.types';

export const findEnglishDescription = (
  entries: PokeApiFlavorTextEntry[],
): string | undefined => {
  if (!entries || !Array.isArray(entries)) return undefined;
  return entries.find((entry) => entry.language?.name === 'en')?.flavor_text;
};

export const cleanDescription = (description?: string): string => {
  if (!description) {
    return 'No description available.';
  }
  return description
    .replace(/[\n\f\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getHabitat = (habitat: PokeApiHabitat | null): string => {
  return habitat ? habitat.name : 'unknown';
};
