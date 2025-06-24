import { PaginationInfo } from './pagination-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseList<T> {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
  })
  isSuccessful: boolean;

  @ApiProperty({
    example: 'Data retrieved successfully',
    description: 'Optional message describing the result',
    required: false,
  })
  message?: string;

  @ApiProperty({
    type: 'array',
    description: 'Array of items',
    isArray: true,
  })
  listContent: T[];

  @ApiProperty({
    type: PaginationInfo,
    description: 'Pagination information',
    required: false,
  })
  paginationInfo?: PaginationInfo;
}
