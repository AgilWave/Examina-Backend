import { IsNumber, IsPositive, IsBoolean, IsOptional } from 'class-validator';

export class UpdateConnectionStatusDto {
  @IsNumber()
  @IsPositive()
  examId: number;

  @IsNumber()
  @IsPositive()
  studentId: number;

  @IsBoolean()
  @IsOptional()
  isConnected: boolean;

  @IsBoolean()
  @IsOptional()
  isSubmitted: boolean;

  @IsOptional()
  submittedAt: string;
}
