import * as nock from 'nock';

process.env.POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon-species';
process.env.FUN_TRANSLATIONS_API_URL =
  'https://api.funtranslations.com/translate';

nock.disableNetConnect();
nock.enableNetConnect(
  (host) => host.includes('127.0.0.1') || host.includes('localhost'),
);
