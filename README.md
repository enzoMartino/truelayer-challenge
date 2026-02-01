# TrueLayer Challenge - Pokedex API

A RESTful API built with NestJS to retrieve Pokemon information. This service acts as a proxy to the PokeAPI, enhancing response times with caching and providing standardized error handling.

## Features

- **Get Pokemon Info**: Retrieves description and habitat information.
- **Caching**: In-memory caching (1 hour TTL) to reduce downstream API load.
- **Observability**:
  - Request Tracing (Correlation IDs via `nestjs-cls`).
  - Structured Logging (`pino-logger`).
  - Outgoing HTTP logging.
- **Reliability**: Standardized API Error responses.
- **Development**: Docker-ready environment.

## Prerequisites

- Node.js (v18+)
- npm (v9+)

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `POKEMON_API_URL` | Upstream PokeAPI URL | `https://pokeapi.co/api/v2/pokemon-species` |
| `LOG_LEVEL` | Logging verbosity (trace, debug, info, etc) | `info` |

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Documentation

Once the application is running, Swagger documentation is available at:

- http://localhost:3000/api

## API Endpoints

### `GET /pokemon/:name`

Returns basic Pokemon information.

**Response:**
```json
{
  "name": "charizard",
  "description": "Spits fire that is hot enough to melt boulders.",
  "habitat": "mountain",
  "isLegendary": false
}
```
