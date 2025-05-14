import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exams } from './entities/exams.entitiy';
import { ExamParticipant } from './entities/exam-participants.entity';
import { ExamResource } from './entities/exam-resources.entity';
import { ExamAnswer } from './entities/exam-answers.entity';
import { ExamQuestion } from './entities/examquestions.entity';
import { ExamAnswerOption } from './entities/answer-option.entity';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exams,
      ExamParticipant,
      ExamResource,
      ExamAnswer,
      ExamQuestion,
      ExamAnswerOption,
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
