import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email',
    type: String,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User name',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'User microsoft id',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  microsoftId?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['student', 'lecturer', 'admin', 'superAdmin'],
    enumName: 'UserRole',
    required: false,
  })
  @IsEnum(['student', 'lecturer', 'admin', 'superAdmin'], {
    message: 'Role must be either student, lecturer, admin or supre admin',
  })
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'User username',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'User created by',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
