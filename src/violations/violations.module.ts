import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViolationsController } from './violations.controller';
import { ViolationsService } from './violations.service';
import { ExamViolation } from './entities/exam-violation.entity';
import { Exams } from '../exams/entities/exams.entitiy';
import { Student } from '../user/entities/student.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([ExamViolation, Exams, Student])],
  controllers: [ViolationsController],
  providers: [ViolationsService],
  exports: [ViolationsService],
})
export class ViolationsModule {}
