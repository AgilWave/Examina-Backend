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
import { ExamStatusScheduler } from './cornSchedulers/exam-status.scheduler';
import { EmailModule } from '../email/email.module';
import { Student } from '../user/entities/student.entitiy';

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
    EmailModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService, ExamStatusScheduler],
  exports: [ExamsService],
})
export class ExamsModule {}
