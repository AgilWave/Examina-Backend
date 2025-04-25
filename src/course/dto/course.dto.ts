import { IsBoolean, IsArray, IsString, IsInt, IsOptional, IsNumber } from 'class-validator';

export class CreateCourseDTO {
  @IsString()
  name: string;

  @IsNumber()
  @IsInt()
  facultyId: number;

  @IsArray()
  @IsInt({ each: true })
  moduleIds: number[];

  @IsString()
  @IsOptional()
  createdBy?: string;

}

export class UpdateCourseDTO {
  @IsString()
  name: string;

  @IsNumber()
  @IsInt()
  facultyId: number;
  
  @IsArray()
  @IsInt({ each: true })
  moduleIds: number[];

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}
