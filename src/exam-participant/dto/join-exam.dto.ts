import { IsNumber, IsPositive } from 'class-validator';

export class JoinExamDto {
  @IsNumber()
  @IsPositive()
  examId: number;

  @IsNumber()
  @IsPositive()
  studentId: number;
}
