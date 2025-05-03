import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAnswerOptionDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  clarification?: string;

  @IsNotEmpty()
  isCorrect: boolean;
}
