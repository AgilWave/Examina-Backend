import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateViolationDTO {
  @IsString()
  examId: string;

  @IsString()
  studentId: string;

  @IsString()
  violationType: string;

  @IsNumber()
  count: number;

  @IsOptional()
  @IsString()
  socketId?: string;

  @IsOptional()
  @IsDateString()
  violationTimestamp?: string;

  @IsOptional()
  @IsString()
  webcamScreenshotPath?: string;

  @IsOptional()
  @IsString()
  screenScreenshotPath?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
