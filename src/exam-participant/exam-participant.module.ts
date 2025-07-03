import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exams } from '../exams/entities/exams.entitiy';
import { ExamParticipant } from '../exams/entities/exam-participants.entity';
import { ExamResource } from '../exams/entities/exam-resources.entity';
import { ExamAnswer } from '../exams/entities/exam-answers.entity';
import { ExamQuestion } from '../exams/entities/examquestions.entity';
import { ExamAnswerOption } from '../exams/entities/answer-option.entity';
import { Student } from '../user/entities/student.entitiy';
import { ExamViolation } from '../violations/entities/exam-violation.entity';
import { ExamParticipantController } from './exam-participant.controller';
import { ExamParticipantService } from './exam-participant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exams,
      ExamParticipant,
      ExamResource,
      ExamAnswer,
      ExamQuestion,
      ExamAnswerOption,
      Student,
      ExamViolation,
    ]),
  ],
  controllers: [ExamParticipantController],
  providers: [ExamParticipantService],
  exports: [ExamParticipantService],
})
export class ExamParticipantModule {}
