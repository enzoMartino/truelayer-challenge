# Agent Guidelines & Project Patterns

## Project Architecture
- **Framework**: NestJS (Strict Mode)
- **Language**: TypeScript
- **Package Manager**: npm

## Code Style & Quality
- **Linting**: ESLint (Standard NestJS config).
- **Formatting**: Prettier.
- **Git Hooks**: Husky `pre-push` executes `npm run lint` and `npm run test`.

## Production Readiness Patterns
1.  **Security**:
    - `helmet` enabled in `main.ts` for security headers.
    - Rate limiting via `@nestjs/throttler` imported in `AppModule`.
    - Input validation via `class-validator` and `class-transformer` (Global ValidationPipe enabled).

2.  **Configuration**:
    - `@nestjs/config` for environment variable management (`isGlobal: true`).
    - No hardcoded secrets or API URLs (use `ConfigService`).

3.  **Observability**:
    - Health checks enabled at `/health` using `@nestjs/terminus`.
    - Checks external dependencies (PokeAPI, FunTranslations) and memory usage.

4.  **Documentation**:
    - OpenAPI (Swagger) auto-generated at `/api`.
    - All Controllers and DTOs must use `@nestjs/swagger` decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`).

5.  **Performance**:
    - Caching enabled globally using `@nestjs/cache-manager` to handle external API rate limits.

## Testing Strategy
- **Unit Tests**: Co-located with source files (`.spec.ts`). Mock all dependencies.
- **E2E Tests**: Located in `test/` directory. Test full request/response cycle including Guards/Interceptors.

## Challenge Specifics ("Shakespearean Pokemon API")
### Endpoints
1.  `GET /pokemon/:name`
    - Returns: Name, Description (Standard), Habitat, IsLegendary.
    - Source: PokeAPI.
2.  `GET /pokemon/translated/:name`
    - Returns: Same fields, but description is translated.
    - Logic:
        - **Yoda**: If habitat is `cave` OR `isLegendary` is true.
        - **Shakespeare**: All other cases.
        - **Fallback**: Use standard description if translation fails (e.g., API limits).

### External Services
- **PokeAPI**: `https://pokeapi.co/api/v2/`
- **FunTranslations**: `https://api.funtranslations.com/translate/`
