import { IsArray, IsNumber, IsNotEmpty, ValidateNested } from 'class-validator';

import { CreateQuestionDto } from './create-question.dto';
import { Type } from 'class-transformer';

export class CreateQuestionBatchDto {
  @IsNotEmpty()
  @IsNumber()
  moduleId: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
