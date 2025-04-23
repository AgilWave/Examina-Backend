import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateModulesDTO {
  @IsString()
  name: string;

  @IsNumber()
  facultyId: number;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateModulesDTO {
  @IsString()
  name: string;

  @IsNumber()
  facultyId: number;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}
