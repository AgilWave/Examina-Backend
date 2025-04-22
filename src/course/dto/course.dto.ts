import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateCourseDTO {
  @IsString()
  name: string;

  @IsNumber()
  facultyId: number;
}

export class UpdateCourseDTO {
  @IsString()
  name: string;

  @IsNumber()
  facultyId: number;

  @IsBoolean()
  isActive: boolean;
}
