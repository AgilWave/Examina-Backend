import { IsNumber, IsPositive, IsOptional } from 'class-validator';

export class ExamHistoryDto {
  @IsNumber()
  @IsPositive()
  batchId: number;

  @IsNumber()
  @IsPositive()
  studentId: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pageSize?: number;
}
