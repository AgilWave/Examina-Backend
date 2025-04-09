import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFacultyDTO {
  @IsString()
  @IsNotEmpty({ message: 'Faculty name is required' })
  name: string;
}

export class UpdateFacultyDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
