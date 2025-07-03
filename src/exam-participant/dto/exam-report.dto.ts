import { IsNumber, IsPositive } from 'class-validator';

export class ExamReportDto {
  @IsNumber()
  @IsPositive()
  examId: number;
}
