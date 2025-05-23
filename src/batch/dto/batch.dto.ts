import { IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreateBatchDTO {
  @IsString()
  batchCode: string;

  @IsNumber()
  year: number;

  @IsNumber()
  courseId: number;
}

export class UpdateBatchDTO {
  @IsString()
  batchCode: string;

  @IsNumber()
  year: number;

  @IsNumber()
  courseId: number;

  @IsBoolean()
  isActive: boolean;
}
