import { IsNotEmpty, IsString } from 'class-validator';

export class JoinExamRequest {
  @IsString()
  @IsNotEmpty({ message: 'Exam ID is required' })
  examId: string;

  @IsString()
  @IsNotEmpty({ message: 'Student ID is required' })
  studentId: string;
}
