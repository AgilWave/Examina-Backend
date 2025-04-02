import { IsString, IsBoolean } from 'class-validator';

export class BlackListUserDto {
  @IsBoolean()
  isBlacklisted?: boolean;

  @IsString()
  blacklistedReason?: string;
}
