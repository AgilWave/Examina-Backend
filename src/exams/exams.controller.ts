import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamsService } from './exams.service';
import { ExamFilterDto } from './dto/filter.dto';
import { CreateExamDTO } from './dto/exams.dto';
import { User as CurrentUser } from '../user/user.decorator';
import { User } from '../user/entities/user.entitiy';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examService: ExamsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('Search')
  getAllExams(@Query() filterDto: ExamFilterDto) {
    try {
      return this.examService.findAll(filterDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Exams',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  

  @UseGuards(JwtAuthGuard)
  @Post('Interact')
  async createBatch(
    @Body() createExamDTO: CreateExamDTO,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.examService.create(createExamDTO, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error creating Exams',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

}
