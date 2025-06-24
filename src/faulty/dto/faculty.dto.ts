import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacultyDTO {
  @ApiProperty({
    description: 'Faculty name',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Faculty name is required' })
  name: string;
}

export class UpdateFacultyDTO {
  @ApiProperty({
    description: 'Faculty name',
    type: String,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Faculty is active',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
