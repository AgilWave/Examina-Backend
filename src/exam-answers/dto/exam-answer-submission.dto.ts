import {
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class ExamAnswerSubmissionDto {
  @IsNumber()
  @IsPositive()
  examId: number;

  @IsNumber()
  @IsPositive()
  questionId: number;

  @IsString()
  answer: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeTaken?: number;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
