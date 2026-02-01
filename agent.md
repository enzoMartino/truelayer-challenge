# Agent Guidelines & Project Patterns

## Workflow Rules (CRITICAL)
1. **Read Guidelines First**: You MUST read this `agent.md` file before writing any code to ensure you are following the latest project patterns and standards.
2. **Prettier Formatting**: Ensure that the Prettier configuration is respected. The project is configured to format on save, but when generating code, try to adhere to Prettier standards (e.g., single quotes, trailing commas) to minimize noise.

## Project Architecture
- **Framework**: NestJS (Strict Mode)
- **Language**: TypeScript
- **Package Manager**: npm

## Code Style & Quality
- **Linting**: ESLint (Standard NestJS config).
    - **Object Shorthand**: Always use object shorthand syntax where possible (`{ value }` instead of `{ value: value }`).
- **Formatting**: Prettier.
- **Git Hooks**: Husky `pre-push` executes `npm run lint`, `npm run test` (unit), `npm run test:e2e` (integration/startup), and `npm run build`.
- **Strict Typing**:
    - **No `any`**: Explicitly forbid usage of `any`. Use `unknown`, strict interfaces, or generics instead.
    - **No Magic Casts**: Avoid `as any` casts in tests or logic. Use `@ts-expect-error` for testing runtime failures if absolutely necessary.

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
    - **Tracing**: Request tracing enabled using `nestjs-cls`. `traceId` is available in logs, error responses, and can be retrieved via `ClsService`.

4.  **Documentation**:
    - OpenAPI (Swagger) auto-generated at `/api`.
    - All Controllers and DTOs must use `@nestjs/swagger` decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`).
    - **Unified Error Interface**: When building new endpoints, always use the `ApiErrorResponseDto` for `@ApiResponse` decorators to ensure consistent error documentation in Swagger.

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
