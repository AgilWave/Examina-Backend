import { IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  attachment?: string;

  @IsOptional()
  answerOptions: CreateAnswerOptionDto[] | null;
}
