import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsOptional()
  microsoftId?: string;

  @IsEnum(['student', 'lecturer', 'admin', 'superAdmin'], {
    message: 'Role must be either student, lecturer, admin or supre admin',
  })
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
