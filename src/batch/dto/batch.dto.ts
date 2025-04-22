import { IsNumber } from 'class-validator';

export class CreateBatchDTO {
  batchCode: string;

  @IsNumber()
  year: number;

  @IsNumber()
  courseId: number;
}

export class UpdateBatchDTO {
  batchCode: string;

  @IsNumber()
  year: number;

  @IsNumber()
  courseId: number;
}
