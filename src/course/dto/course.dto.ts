import { IsBoolean, IsArray, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCourseDTO {
  @IsString()
  name: string;

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

  @IsArray()
  @IsInt({ each: true })
  moduleIds: number[];

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}
