import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exams } from '../exams/entities/exams.entitiy';
import { ExamParticipant } from '../exams/entities/exam-participants.entity';
import { ExamResource } from '../exams/entities/exam-resources.entity';
import { ExamAnswer } from '../exams/entities/exam-answers.entity';
import { ExamQuestion } from '../exams/entities/examquestions.entity';
import { ExamAnswerOption } from '../exams/entities/answer-option.entity';
import { Student } from '../user/entities/student.entitiy';
import { ExamAnswerController } from './exam-answers.controller';

import { ExamAnswerService } from './exam-answers.service';

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
    ]),
  ],
  controllers: [ExamAnswerController],
  providers: [ExamAnswerService],
  exports: [ExamAnswerService],
})
export class ExamAnswerModule {}
