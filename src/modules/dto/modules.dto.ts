import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateModulesDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateModulesDTO {
  @IsString()
  name: string;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}
