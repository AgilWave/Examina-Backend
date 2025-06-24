import { ApiProperty } from '@nestjs/swagger';

export class ResponseContent<T> {
  @ApiProperty()
  isSuccessful: boolean;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty()
  content: T[] | T | null;
}
