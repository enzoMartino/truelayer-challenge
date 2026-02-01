import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { PokemonRepository } from './repositories/pokemon.repository';
import { TranslationRepository } from './repositories/translation.repository';
import { createPokemon } from '../../test/factories/pokemon.factory';

describe('PokemonService', () => {
  let service: PokemonService;
  let pokemonRepository: PokemonRepository;
  let translationRepository: TranslationRepository;

  const mockPokemonRepository = {
    getPokemon: jest.fn(),
  };

  const mockTranslationRepository = {
    translate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        {
          provide: PokemonRepository,
          useValue: mockPokemonRepository,
        },
        {
          provide: TranslationRepository,
          useValue: mockTranslationRepository,
        },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    pokemonRepository = module.get<PokemonRepository>(PokemonRepository);
    translationRepository = module.get<TranslationRepository>(
      TranslationRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPokemon', () => {
    it('should call repository.getPokemon and return result', async () => {
      const expectedPokemon = createPokemon();
      mockPokemonRepository.getPokemon.mockResolvedValue(expectedPokemon);

      const result = await service.getPokemon('charizard');

      expect(pokemonRepository.getPokemon).toHaveBeenCalledWith('charizard');
      expect(result).toEqual(expectedPokemon);
    });
  });

  describe('getTranslatedPokemon', () => {
    it('should use Yoda translation for legendary pokemon', async () => {
      const pokemon = createPokemon({
        isLegendary: true,
        description: 'Original',
      });
      mockPokemonRepository.getPokemon.mockResolvedValue(pokemon);
      mockTranslationRepository.translate.mockResolvedValue('Yoda Translated');

      const result = await service.getTranslatedPokemon('mewtwo');

      expect(translationRepository.translate).toHaveBeenCalledWith(
        'Original',
        'yoda',
      );
      expect(result.description).toBe('Yoda Translated');
    });

    it('should use Yoda translation for cave habitat pokemon', async () => {
      const pokemon = createPokemon({
        isLegendary: false,
        habitat: 'cave',
        description: 'Original',
      });
      mockPokemonRepository.getPokemon.mockResolvedValue(pokemon);
      mockTranslationRepository.translate.mockResolvedValue('Yoda Translated');

      const result = await service.getTranslatedPokemon('batman');

      expect(translationRepository.translate).toHaveBeenCalledWith(
        'Original',
        'yoda',
      );
      expect(result.description).toBe('Yoda Translated');
    });

    it('should use Shakespeare translation for other pokemon', async () => {
      const pokemon = createPokemon({
        isLegendary: false,
        habitat: 'forest',
        description: 'Original',
      });
      mockPokemonRepository.getPokemon.mockResolvedValue(pokemon);
      mockTranslationRepository.translate.mockResolvedValue(
        'Shakespeare Translated',
      );

      const result = await service.getTranslatedPokemon('worm');

      expect(translationRepository.translate).toHaveBeenCalledWith(
        'Original',
        'shakespeare',
      );
      expect(result.description).toBe('Shakespeare Translated');
    });

    it('should fallback to original description if translation fails', async () => {
      const pokemon = createPokemon({ description: 'Original' });
      mockPokemonRepository.getPokemon.mockResolvedValue(pokemon);
      mockTranslationRepository.translate.mockRejectedValue(
        new Error('API Failure'),
      );

      const result = await service.getTranslatedPokemon('worm');

      expect(translationRepository.translate).toHaveBeenCalled();
      expect(result.description).toBe('Original');
    });
  });
});
