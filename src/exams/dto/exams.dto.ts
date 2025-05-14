import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ExamQuestion } from '../entities/examquestions.entity';

export class CreateExamDTO {
  @IsNumber()
  @IsNotEmpty({ message: 'Faculty ID is required' })
  facultyId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Batch ID is required' })
  batchId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Module ID is required' })
  moduleId: number;

  @IsString()
  @IsNotEmpty({ message: 'Exam name is required' })
  examName: string;

  @IsString()
  @IsNotEmpty({ message: 'Exam code is required' })
  examCode: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Lecture ID is required' })
  lectureId: number;

  @IsDateString()
  @IsNotEmpty({ message: 'Exam date is required' })
  examDate: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Start time is required' })
  startTime: string;

  @IsDateString()
  @IsNotEmpty({ message: 'End time is required' })
  endTime: string;

  @IsString()
  @IsNotEmpty({ message: 'Exam mode is required' })
  examMode: string;

  @IsBoolean()
  @IsOptional()
  randomizeQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  randomizeAnswers?: boolean;

  @IsBoolean()
  @IsOptional()
  allowBackTracking?: boolean;

  @IsBoolean()
  @IsOptional()
  lateEntry?: boolean;

  @IsNumber()
  @IsOptional()
  lateEntryTime?: number;

  @IsBoolean()
  @IsOptional()
  webcamRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  micRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  networkStrengthTest?: boolean;

  @IsBoolean()
  @IsOptional()
  lockdownBrowser?: boolean;

  @IsBoolean()
  @IsOptional()
  surroundingEnvironmentCheck?: boolean;

  @IsArray()
  @IsNotEmpty({ message: 'Exam questions are required' })
  examQuestions: ExamQuestion[];

  @IsBoolean()
  @IsOptional()
  notifyStudents?: boolean;

  @IsBoolean()
  @IsOptional()
  sendReminders?: boolean;

  @IsNumber()
  @IsOptional()
  reminderTime?: number;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  createdAt?: Date;
}
