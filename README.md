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

Ensure you have the following installed on your system:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Required for containerization and running the production environment.
- **[Node.js](https://nodejs.org/)** (v18 or higher): Required for local development.
- **[npm](https://www.npmjs.com/)** (v9 or higher): Package manager usually included with Node.js.

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd truelayer-challenge
   ```

2. **Install dependencies** (for local development)
   ```bash
   npm install
   ```

## Running with Docker (Recommended)

This is the easiest way to run the application as it handles all dependencies and environment setup automatically.

1. **Start the application**
   ```bash
   docker-compose up --build
   ```

   The application will be available at http://localhost:3000.

2. **Verify Docker Setup**
   We have included automated scripts to verify the Docker container is building and running correctly:
   
   **Verify Dockerfile (single container):**
   ```bash
   npm run test:docker
   ```

   **Verify Docker Compose (full stack):**
   ```bash
   npm run test:docker-compose
   ```

## Local Development

If you prefer to run the application locally without Docker:

1. **Start the app**
   ```bash
   # development
   npm run start
   
   # watch mode (auto-reload)
   npm run start:dev
   ```

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `POKEMON_API_URL` | Upstream PokeAPI URL | `https://pokeapi.co/api/v2/pokemon-species` |
| `FUN_TRANSLATIONS_API_URL` | Upstream FunTranslations API URL | `https://api.funtranslations.com/translate` |
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

### `GET /v1/pokemon/:name`

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

### `GET /v1/pokemon/translated/:name`

Returns Pokemon information with a translated description.


- **Yoda translation**: If the Pokemon's habitat is `cave` or it is legendary.
- **Shakespeare translation**: For all other Pokemon.
- **Fallback**: Returns standard description if translation service is unavailable.

**Response:**
```json
{
  "name": "mewtwo",
  "description": "Created by a scientist, it was.",
  "habitat": "rare",
  "isLegendary": true
}
```

## Design & Approach

### Architectural Pattern
The application follows a standard **Layered Architecture** (Controller → Service → Repository) to ensure separation of concerns and testability:
- **Controllers**: Handle HTTP transport, validation, caching headers, and response serialization.
- **Services**: Contain business logic and orchestration (e.g., deciding which translation strategy to use).
- **Repositories**: Encapsulate external API interactions, handling specific error codes (429, 500) and response mapping. This ensures the Core Service is decoupled from `axios` implementation details.

### Resilience Strategy
The application is designed to be resilient to upstream failures, ensuring a robust user experience:
- **Retries**: Transient failures (5xx, Network Errors) are automatically retried with exponential backoff.
- **Graceful Degradation**: If the Translation API is unavailable (e.g., Rate Limited 429), the service explicitly catches the error and falls back to the standard description rather than failing the user's request.

### Testing Strategy
- **Unit Tests**: Focused on pure business logic (e.g., `translation.utils.ts`) to verify business rules (Yoda vs Shakespeare) without extensive mocking.
- **E2E Tests**: Extensive use of `nock` to verify infrastructure resilience, simulating 500 errors to test retries and 429 errors to test fallbacks.
- **Factories**: Test data generation is centralized in `test/factories` to prevent brittle tests.

### Observability
- **Correlation IDs**: Implemented using `nestjs-cls` to track requests across the application lifecycle.
- **Structured Logging**: Uses `pino` for JSON-formatted logs, ensuring logs are machine-readable and ready for ingestion by aggregation tools (ELK, Datadog).

## Production Considerations

While this application meets the requirements of the challenge, for a high-scale production environment, the following architectural improvements would be considered:

1.  **Distributed Caching (Redis)**:
    -   *Current*: In-Memory cache.
    -   *Improvement*: Replace with Redis. In a Kubernetes environment with multiple replicas, in-memory caches are not shared, leading to low cache hit ratios and redundant upstream requests.

2.  **Circuit Breaker Pattern**:
    -   *Current*: Retry mechanism with exponential backoff.
    -   *Improvement*: Implement a full Circuit Breaker (e.g., Opossum). If an upstream API is down for an extended period, retrying every request wastes resources. A circuit breaker would "fail fast" to protect the system.

3.  **Secret Management**:
    -   *Current*: `.env` files.
    -   *Improvement*: Integrate with AWS Secrets Manager, HashiCorp Vault, or Kubernetes Secrets to inject sensitive credentials at runtime without storing them on disk.

4.  **Advanced Observability**:
    -   *Current*: Structured logging and correlation IDs.
    -   *Improvement*: Export Prometheus metrics (latency histograms, error rates) and integrate with APM tools (Datadog, New Relic) for real-time alerting.
