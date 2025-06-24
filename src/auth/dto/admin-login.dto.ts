import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AdminLoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Admin username',
    type: String,
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Admin password',
    type: String,
  })
  password: string;
}
