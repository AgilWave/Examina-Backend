import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class ViolationFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsString()
  examId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  violationType?: string;

  @IsOptional()
  @IsIn(['pending', 'reviewed', 'resolved', 'dismissed'])
  status?: string;

  @IsOptional()
  @IsString()
  reviewedBy?: string;
}
