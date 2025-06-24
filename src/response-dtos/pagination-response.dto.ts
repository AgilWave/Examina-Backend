import { ApiProperty } from '@nestjs/swagger';

export class PaginationInfo {
  @ApiProperty({
    example: 1,
    description: 'Current page number (1-based)',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  pageSize: number;

  @ApiProperty({
    example: 100,
    description: 'Total number of items available',
  })
  totalItems: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of pages available',
  })
  totalPages: number;

  @ApiProperty({
    example: 2,
    description: 'Next page number (null if no more pages)',
    nullable: true,
  })
  nextPage: number | null;

  @ApiProperty({
    example: null,
    description: 'Previous page number (null if on first page)',
    nullable: true,
  })
  prevPage: number | null;
}
