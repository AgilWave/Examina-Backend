import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateModulesDTO {
  @ApiProperty({
    description: 'Module name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
  })
  @IsNumber()
  facultyId: number;

  @ApiProperty({
    description: 'Created by',
    type: String,
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateModulesDTO {
  @ApiProperty({
    description: 'Module name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
  })
  @IsNumber()
  facultyId: number;

  @ApiProperty({
    description: 'Module is active',
    type: Boolean,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Updated by',
    type: String,
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
