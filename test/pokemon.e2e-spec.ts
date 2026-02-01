import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as nock from 'nock';
import { createPokemon } from './factories/pokemon.factory';

describe('PokemonController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Reproduce main.ts configuration
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();
  });

  afterEach(async () => {
    nock.cleanAll();
    await app.close();
  });

  describe('GET /v1/pokemon/:name', () => {
    it('should return pokemon details available (200)', () => {
      nock('https://pokeapi.co')
        .get('/api/v2/pokemon-species/charizard')
        .reply(200, {
          name: 'charizard',
          flavor_text_entries: [
            {
              flavor_text: 'Spits fire that is hot enough to melt boulders.',
              language: { name: 'en' },
            },
          ],
          habitat: { name: 'mountain' },
          is_legendary: false,
        });

      return request(app.getHttpServer())
        .get('/v1/pokemon/charizard')
        .expect(200)
        .expect(createPokemon());
    });

    it('should return 404 if pokemon not found', () => {
      nock('https://pokeapi.co')
        .get('/api/v2/pokemon-species/unknown_pokemon')
        .reply(404);

      return request(app.getHttpServer())
        .get('/v1/pokemon/unknown_pokemon')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });
  });
});
