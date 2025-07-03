import {
  Controller,
  Post,
  UseGuards,
  Body,
  Patch,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamParticipantService } from './exam-participant.service';
import { JoinExamDto } from './dto/join-exam.dto';
import { UpdateConnectionStatusDto } from './dto/update-connection-status.dto';
import { ExamHistoryDto } from './dto/exam-history.dto';
import { ExamReportDto } from './dto/exam-report.dto';

@Controller('exam-participants')
@UseGuards(JwtAuthGuard)
export class ExamParticipantController {
  constructor(
    private readonly examParticipantService: ExamParticipantService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('join')
  joinExam(@Body() joinExamDto: JoinExamDto) {
    try {
      return this.examParticipantService.joinExam(joinExamDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error joining Exam',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  //connection status
  @Patch('connection-status')
  updateConnectionStatus(
    @Body() updateConnectionStatusDto: UpdateConnectionStatusDto,
  ) {
    try {
      return this.examParticipantService.updateConnectionStatus(
        updateConnectionStatusDto,
      );
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating connection status',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // get status of student in exam
  @Get('status/:examId/:studentId')
  getStatusOfStudentInExam(
    @Param('examId') examId: number,
    @Param('studentId') studentId: number,
  ) {
    try {
      return this.examParticipantService.getStatusOfStudentInExam(
        examId,
        studentId,
      );
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error getting status of student in exam',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  //get all students in exam
  @Get(':examId/participants')
  getExamParticipants(@Param('examId') examId: number) {
    try {
      return this.examParticipantService.getExamParticipants(examId);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error getting all students in exam',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  //get conneted students in exam
  @Get(':examId/connected-participants')
  getConnectedStudentsInExam(@Param('examId') examId: number) {
    try {
      return this.examParticipantService.getConnectedStudentsInExam(examId);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error getting connected students in exam',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  //get participant count in exam
  @Get(':examId/participant-count')
  getParticipantCountInExam(@Param('examId') examId: number) {
    try {
      return this.examParticipantService.getParticipantCountInExam(examId);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error getting participant count in exam',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  //get exam history for student in batch
  @Get('exam-history')
  getExamHistory(
    @Query('batchId') batchId: string,
    @Query('studentId') studentId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const examHistoryDto: ExamHistoryDto = {
        batchId: parseInt(batchId, 10),
        studentId: parseInt(studentId, 10),
        page: page ? parseInt(page, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      };
      return this.examParticipantService.getExamHistory(examHistoryDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error getting exam history',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  //get comprehensive exam report for admin
  @Get('exam-report/:examId')
  getExamReport(@Param('examId') examId: string) {
    try {
      const examReportDto: ExamReportDto = {
        examId: parseInt(examId, 10),
      };
      return this.examParticipantService.getExamReport(examReportDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error getting exam report',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
