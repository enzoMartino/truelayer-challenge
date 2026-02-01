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

  describe('GET /v1/pokemon/translated/:name', () => {
    it('should translate description using Yoda for legendary pokemon', () => {
      nock('https://pokeapi.co')
        .get('/api/v2/pokemon-species/mewtwo')
        .reply(200, {
          name: 'mewtwo',
          flavor_text_entries: [
            {
              flavor_text: 'It was created by a scientist.',
              language: { name: 'en' },
            },
          ],
          habitat: { name: 'rare' },
          is_legendary: true,
        });

      nock('https://api.funtranslations.com')
        .post('/translate/yoda.json', {
          text: 'It was created by a scientist.',
        })
        .reply(200, {
          success: { total: 1 },
          contents: {
            translated: 'Created by a scientist, it was.',
            text: 'It was created by a scientist.',
            translation: 'yoda',
          },
        });

      return request(app.getHttpServer())
        .get('/v1/pokemon/translated/mewtwo')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('mewtwo');
          expect(res.body.description).toBe('Created by a scientist, it was.');
          expect(res.body.habitat).toBe('rare');
          expect(res.body.isLegendary).toBe(true);
        });
    });

    it('should translate description using Yoda for cave pokemon', () => {
      nock('https://pokeapi.co')
        .get('/api/v2/pokemon-species/zubat')
        .reply(200, {
          name: 'zubat',
          flavor_text_entries: [
            {
              flavor_text: 'It lives in caves.',
              language: { name: 'en' },
            },
          ],
          habitat: { name: 'cave' },
          is_legendary: false,
        });

      nock('https://api.funtranslations.com')
        .post('/translate/yoda.json', {
          text: 'It lives in caves.',
        })
        .reply(200, {
          success: { total: 1 },
          contents: {
            translated: 'In caves, it lives.',
            text: 'It lives in caves.',
            translation: 'yoda',
          },
        });

      return request(app.getHttpServer())
        .get('/v1/pokemon/translated/zubat')
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe('In caves, it lives.');
        });
    });

    it('should translate description using Shakespeare for standard pokemon', () => {
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

      nock('https://api.funtranslations.com')
        .post('/translate/shakespeare.json', {
          text: 'Electric mouse.',
        })
        .reply(200, {
          success: { total: 1 },
          contents: {
            translated: 'Electric mouse, forsooth.',
            text: 'Electric mouse.',
            translation: 'shakespeare',
          },
        });

      return request(app.getHttpServer())
        .get('/v1/pokemon/translated/pikachu')
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe('Electric mouse, forsooth.');
        });
    });

    it('should retry on 5xx errors and succeed', () => {
      nock('https://pokeapi.co')
        .get('/api/v2/pokemon-species/retrymon')
        .reply(200, {
          name: 'retrymon',
          flavor_text_entries: [
            {
              flavor_text: 'It perseveres.',
              language: { name: 'en' },
            },
          ],
          habitat: { name: 'forest' },
          is_legendary: false,
        });

      // Fail twice with 500, then succeed
      nock('https://api.funtranslations.com')
        .post('/translate/shakespeare.json')
        .reply(500)
        .post('/translate/shakespeare.json')
        .reply(500)
        .post('/translate/shakespeare.json')
        .reply(200, {
          success: { total: 1 },
          contents: {
            translated: 'It perseveres, forsooth.',
            text: 'It perseveres.',
            translation: 'shakespeare',
          },
        });

      return request(app.getHttpServer())
        .get('/v1/pokemon/translated/retrymon')
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe('It perseveres, forsooth.');
        });
    });

    it('should fallback to standard description if translation API fails', () => {
      nock('https://pokeapi.co')
        .get('/api/v2/pokemon-species/failmon')
        .reply(200, {
          name: 'failmon',
          flavor_text_entries: [
            {
              flavor_text: 'Original description.',
              language: { name: 'en' },
            },
          ],
          habitat: { name: 'forest' },
          is_legendary: false,
        });

      nock('https://api.funtranslations.com')
        .post('/translate/shakespeare.json')
        .reply(429, { error: 'Too Many Requests' });

      return request(app.getHttpServer())
        .get('/v1/pokemon/translated/failmon')
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe('Original description.');
        });
    });
  });
});
