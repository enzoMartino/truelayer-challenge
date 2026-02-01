import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { createPokemon } from '../../../test/factories/pokemon.factory';

describe('PokemonController', () => {
  let controller: PokemonController;
  let service: PokemonService;

  const mockPokemonService = {
    getPokemon: jest.fn(),
    getTranslatedPokemon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
    service = module.get<PokemonService>(PokemonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a pokemon', async () => {
    const expectedResult = createPokemon({
      name: 'mewtwo',
      description: 'Genetic Pokemon',
      habitat: 'rare',
      isLegendary: true,
    });

    mockPokemonService.getPokemon.mockResolvedValue(expectedResult);

    expect(await controller.getPokemon('mewtwo')).toEqual(expectedResult);
    expect(service.getPokemon).toHaveBeenCalledWith('mewtwo');
  });

  it('should return a translated pokemon', async () => {
    const expectedResult = createPokemon({
      description: 'Translated Description',
    });

    mockPokemonService.getTranslatedPokemon.mockResolvedValue(expectedResult);

    expect(await controller.getTranslatedPokemon('mewtwo')).toEqual(
      expectedResult,
    );
    expect(service.getTranslatedPokemon).toHaveBeenCalledWith('mewtwo');
  });
});
