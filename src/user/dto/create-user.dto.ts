import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  microsoftId?: string;

  @IsEnum(['student', 'lecturer', 'admin'], {
    message: 'Role must be either student, lecturer, or admin',
  })
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  isBlacklisted?: boolean;
}
