import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { QuestionsService } from './question.service';
import { QuestionFilterDTO } from './dto/filter.dto';
import { User as CurrentUser } from '../../user/user.decorator';
import { User } from '../../user/entities/user.entitiy';
import { CreateQuestionBatchDto } from './dto/create-question-batch.dto';

@Controller('question-bank/question')
export class QuestionController {
  constructor(private readonly questionService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('Search')
  getAllQuestions(@Query() filterDto: QuestionFilterDTO) {
    try {
      return this.questionService.findAll(filterDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Questions',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    try {
      return this.questionService.findById(id);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Question',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('Interact')
  async createBatch(
    @Body() createQuestiondTO: CreateQuestionBatchDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.questionService.create(createQuestiondTO, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error creating Question',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch('Interact/Update/:id')
  // async updateBatch(
  //   @Param('id') id: number,
  //   @Body() updateDTO: UpdateQuestionsDTO,
  //   @CurrentUser() currentUser: User,
  // ) {
  //   try {
  //     return this.questionService.update(id, updateDTO, currentUser);
  //   } catch (error: unknown) {
  //     return {
  //       isSuccessful: false,
  //       message: 'Error updating Question',
  //       content: error instanceof Error ? error.message : String(error),
  //     };
  //   }
  // }

  // @UseGuards(JwtAuthGuard)
  // @Patch('Interact/Update/:id/Status')
  // async updateBatchStatus(
  //   @Param('id') id: number,
  //   @Body() updateDTO: { status: boolean },
  //   @CurrentUser() currentUser: User,
  // ) {
  //   try {
  //     return this.questionService.updateStatus(id, updateDTO.status, currentUser);
  //   } catch (error: unknown) {
  //     return {
  //       isSuccessful: false,
  //       message: 'Error updating Question Status',
  //       content: error instanceof Error ? error.message : String(error),
  //     };
  //   }
  // }
}
