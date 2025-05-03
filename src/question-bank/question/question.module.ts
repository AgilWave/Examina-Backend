import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modules } from '../../modules/entities/modules.entitiy';
import { Question } from './entities/question.entitiy';
import { AnswerOption } from './entities/answer-option.entity';
import { QuestionsService } from './question.service';
import { QuestionController } from './question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Question, AnswerOption, Modules])],
  controllers: [QuestionController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionModule {}
