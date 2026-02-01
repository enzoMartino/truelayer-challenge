import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { PokemonRepository } from './repositories/pokemon.repository';
import { createPokemon } from '../../test/factories/pokemon.factory';

describe('PokemonService', () => {
  let service: PokemonService;
  let repository: PokemonRepository;

  const mockRepository = {
    getPokemon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        {
          provide: PokemonRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    repository = module.get<PokemonRepository>(PokemonRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPokemon', () => {
    it('should call repository.getPokemon and return result', async () => {
      const expectedPokemon = createPokemon();
      mockRepository.getPokemon.mockResolvedValue(expectedPokemon);

      const result = await service.getPokemon('charizard');

      expect(repository.getPokemon).toHaveBeenCalledWith('charizard');
      expect(result).toEqual(expectedPokemon);
    });
  });
});
