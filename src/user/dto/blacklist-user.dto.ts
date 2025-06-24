import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlackListUserDto {
  @IsBoolean()
  @ApiProperty({
    description: 'Is the user blacklisted',
    type: Boolean,
  })
  isBlacklisted?: boolean;

  @IsString()
  @ApiProperty({
    description: 'Reason for blacklisting the user',
    type: String,
  })
  blacklistedReason?: string;
}
