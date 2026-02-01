export interface PokeApiLanguage {
  name: string;
  url: string;
}

export interface PokeApiFlavorTextEntry {
  flavor_text: string;
  language: PokeApiLanguage;
  version?: unknown; // We don't use version, keeping it loose or omitting is fine, but for completeness
}

export interface PokeApiHabitat {
  name: string;
  url: string;
}

export interface PokeApiSpeciesResponse {
  name: string;
  flavor_text_entries: PokeApiFlavorTextEntry[];
  habitat: PokeApiHabitat | null;
  is_legendary: boolean;
  // There are many other fields in the real API, but we define only what we consume
}
