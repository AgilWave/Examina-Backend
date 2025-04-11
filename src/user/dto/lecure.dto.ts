import { IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateLectureDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  facultyIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  courseIds?: number[];

  @IsOptional()
  createdBy?: string;
}

export class UpdateLectureDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  facultyIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  courseIds?: number[];
}
