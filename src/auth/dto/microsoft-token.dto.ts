import { IsString, IsNotEmpty } from 'class-validator';

export class MicrosoftTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
