import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['email', 'name', 'role'] as const),
) {
  @ApiProperty({
    description: 'Updated by',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;

  @ApiProperty({
    description: 'Password',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;
}
