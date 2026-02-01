import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Pokemon } from '@/pokemon/entities/pokemon.entity';
import { ApiErrorResponseDto } from '@/common/dto/api-error-response.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('pokemon')
@Controller({
  path: 'pokemon',
  version: '1',
})
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get(':name')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get basic Pokemon information' })
  @ApiParam({ name: 'name', description: 'The name of the Pokemon' })
  @ApiResponse({
    status: 200,
    description: 'The Pokemon information',
    type: Pokemon,
  })
  @ApiResponse({
    status: 404,
    description: 'Pokemon not found',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiErrorResponseDto,
  })
  getPokemon(@Param('name') name: string) {
    return this.pokemonService.getPokemon(name);
  }

  @Get('translated/:name')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: 'Get Pokemon information with translated description',
  })
  @ApiParam({ name: 'name', description: 'The name of the Pokemon' })
  @ApiResponse({
    status: 200,
    description: 'The Pokemon information with translated description',
    type: Pokemon,
  })
  @ApiResponse({
    status: 404,
    description: 'Pokemon not found',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiErrorResponseDto,
  })
  getTranslatedPokemon(@Param('name') name: string) {
    return this.pokemonService.getTranslatedPokemon(name);
  }
}
