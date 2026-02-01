import { Test, TestingModule } from '@nestjs/testing';
import { PokeApiRepository } from './poke-api.repository';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { createPokemon } from '../../../test/factories/pokemon.factory';
import * as nock from 'nock';

describe('PokeApiRepository', () => {
  let repository: PokeApiRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        PokeApiRepository,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockReturnValue('https://pokeapi.co/api/v2/pokemon-species'),
          },
        },
      ],
    }).compile();

    repository = module.get<PokeApiRepository>(PokeApiRepository);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getPokemon', () => {
    it('should return pokemon data when found', async () => {
      nock('https://pokeapi.co')
        .get('/api/v2/pokemon-species/pikachu')
        .reply(200, {
          name: 'pikachu',
          flavor_text_entries: [
            {
              flavor_text: 'Electric mouse.',
              language: { name: 'en' },
            },
          ],
          habitat: { name: 'forest' },
          is_legendary: false,
        });

      const result = await repository.getPokemon('pikachu');

      expect(result).toEqual(
        createPokemon({
          name: 'pikachu',
          description: 'Electric mouse.',
          habitat: 'forest',
          isLegendary: false,
        }),
      );
    });

    it('should throw NotFoundException if Pokemon not found (404)', async () => {
      nock('https://pokeapi.co')
        .get('/api/v2/pokemon-species/unknown')
        .reply(404);

      await expect(repository.getPokemon('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
