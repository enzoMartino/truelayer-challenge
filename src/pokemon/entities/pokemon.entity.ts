import { ApiProperty } from '@nestjs/swagger';

export class Pokemon {
  @ApiProperty({ example: 'mewtwo', description: 'The name of the Pokemon' })
  name: string;

  @ApiProperty({
    example:
      'It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.',
    description: 'The standard description of the Pokemon',
  })
  description: string;

  @ApiProperty({ example: 'rare', description: 'The habitat of the Pokemon' })
  habitat: string;

  @ApiProperty({
    example: true,
    description: 'Whether the Pokemon is legendary',
  })
  isLegendary: boolean;
}
