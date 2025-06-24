import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamAnswerSubmissionDto } from './dto/exam-answer-submission.dto';
import { ExamAnswerService } from './exam-answers.service';
import { ResponseContent } from 'src/response-dtos/responseContent.dto';
import { ExamAnswer } from 'src/exams/entities/exam-answers.entity';

@Controller('exam-answers')
@UseGuards(JwtAuthGuard)
export class ExamAnswerController {
  constructor(private readonly examAnswersService: ExamAnswerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitExamAnswers(
    @Body() answers: ExamAnswerSubmissionDto[],
  ): Promise<ResponseContent<ExamAnswer>> {
    return this.examAnswersService.submitExamAnswers(answers);
  }
}
