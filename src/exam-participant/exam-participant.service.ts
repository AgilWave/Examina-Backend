import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { Student } from '../user/entities/student.entitiy';
import { ExamParticipant } from '../exams/entities/exam-participants.entity';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { JoinExamDto } from './dto/join-exam.dto';
import { UpdateConnectionStatusDto } from './dto/update-connection-status.dto';
import { ExamHistoryDto } from './dto/exam-history.dto';
import { ExamReportDto } from './dto/exam-report.dto';
import { Exams } from 'src/exams/entities/exams.entitiy';
import { ExamAnswer } from 'src/exams/entities/exam-answers.entity';
import { ExamViolation } from 'src/violations/entities/exam-violation.entity';

export interface ParticipantStatus {
  hasJoined: boolean;
  joinedAt: string;
  isConnected: boolean;
  disconnectedAt?: string;
  isSubmitted: boolean;
}
@Injectable()
export class ExamParticipantService {
  constructor(
    @InjectRepository(ExamParticipant)
    private readonly examParticipantRepository: Repository<ExamParticipant>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
    @InjectRepository(ExamAnswer)
    private readonly examAnswerRepository: Repository<ExamAnswer>,
    @InjectRepository(ExamViolation)
    private readonly examViolationRepository: Repository<ExamViolation>,
  ) {}

  async joinExam(
    joinExamDto: JoinExamDto,
  ): Promise<ResponseContent<ExamParticipant>> {
    const exam = await this.examsRepository.findOne({
      where: { id: joinExamDto.examId },
    });

    if (!exam) {
      return {
        isSuccessful: false,
        message: 'Exam not found',
        content: null,
      };
    }

    const student = await this.studentRepository.findOne({
      where: { userId: joinExamDto.studentId },
    });

    if (!student) {
      return {
        isSuccessful: false,
        message: 'Student not found',
        content: null,
      };
    }

    if (student) {
      joinExamDto.studentId = student.id;
    }

    //check if student exists
    const existingParticipant = await this.examParticipantRepository.findOne({
      where: {
        exam: { id: joinExamDto.examId },
        student: { id: joinExamDto.studentId },
      },
    });

    if (existingParticipant) {
      existingParticipant.isConnected = true;
      //@ts-expect-error - this is a temporary fix to allow the student to join the exam
      existingParticipant.disconnectedAt = null;
      await this.examParticipantRepository.save(existingParticipant);
      return {
        isSuccessful: true,
        message: 'Student joined the exam',
        content: existingParticipant,
      };
    }

    const participant = this.examParticipantRepository.create({
      exam: { id: joinExamDto.examId },
      student: { id: joinExamDto.studentId },
      isConnected: true,
      joinedAt: new Date(),
    });
    await this.examParticipantRepository.save(participant);

    return {
      isSuccessful: true,
      message: 'Student joined the exam',
      content: participant,
    };
  }

  //update connection status
  async updateConnectionStatus(
    updateConnectionStatusDto: UpdateConnectionStatusDto,
  ): Promise<ResponseContent<ExamParticipant>> {
    const { examId, studentId, isConnected, isSubmitted, submittedAt } =
      updateConnectionStatusDto;

    const participant = await this.examParticipantRepository.findOne({
      where: { exam: { id: examId }, student: { id: studentId } },
    });

    if (!participant) {
      return {
        isSuccessful: false,
        message: 'Participant not found',
        content: null,
      };
    }

    participant.isConnected = isConnected;

    if (isConnected) {
      //@ts-expect-error - this is a temporary fix to allow the student to join the exam
      participant.disconnectedAt = null;
    } else {
      participant.disconnectedAt = new Date();
    }

    participant.isSubmitted = isSubmitted;
    participant.submittedAt = submittedAt;

    await this.examParticipantRepository.save(participant);

    return {
      isSuccessful: true,
      message: 'Connection status updated',
      content: participant,
    };
  }

  //get status of student in exam
  async getStatusOfStudentInExam(
    examId: number,
    studentId: number,
  ): Promise<ResponseContent<ParticipantStatus>> {
    const participant = await this.examParticipantRepository.findOne({
      where: { exam: { id: examId }, student: { id: studentId } },
    });

    if (!participant) {
      return {
        isSuccessful: false,
        message: 'Participant not found',
        content: null,
      };
    }

    return {
      isSuccessful: true,
      message: 'Participant status fetched',
      content: {
        hasJoined: true,
        joinedAt: participant.joinedAt.toISOString(),
        isConnected: participant.isConnected,
        disconnectedAt: participant.disconnectedAt?.toISOString(),
        isSubmitted: participant.isSubmitted,
      },
    };
  }

  //get all students in exam
  async getExamParticipants(
    examId: number,
  ): Promise<ResponseList<ExamParticipant>> {
    const page = 1;
    const pageSize = 10;

    const totalItems = await this.examParticipantRepository.count({
      where: { exam: { id: examId } },
    });
    const totalPages = Math.ceil(totalItems / pageSize);

    const participants = await this.examParticipantRepository
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.student', 'student')
      .where('participant.examId = :examId', { examId })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('participant.joinedAt', 'DESC')
      .getMany();

    const paginationInfo: PaginationInfo = {
      page,
      pageSize,
      totalItems,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };

    return {
      isSuccessful: true,
      message: 'Participants fetched',
      listContent: participants,
      paginationInfo: paginationInfo,
    };
  }

  //get connected students in exam
  async getConnectedStudentsInExam(
    examId: number,
  ): Promise<ResponseList<ExamParticipant>> {
    const participants = await this.examParticipantRepository
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.student', 'student')
      .where('participant.examId = :examId', { examId })
      .andWhere('participant.isConnected = :isConnected', { isConnected: true })
      .getMany();

    if (participants.length === 0) {
      return {
        isSuccessful: true,
        message: 'No connected participants found',
        listContent: [],
        paginationInfo: undefined,
      };
    }
    return {
      isSuccessful: true,
      message: 'Connected parti cipants fetched',
      listContent: participants,
      paginationInfo: undefined,
    };
  }

  //get participant count in exam
  async getParticipantCountInExam(
    examId: number,
  ): Promise<ResponseContent<number>> {
    const count = await this.examParticipantRepository.count({
      where: { exam: { id: examId } },
    });

    return {
      isSuccessful: true,
      message: 'Participant count fetched',
      content: count,
    };
  }

  //get exam history for student in batch
  async getExamHistory(
    examHistoryDto: ExamHistoryDto,
  ): Promise<ResponseList<any>> {
    const { batchId, studentId, page = 1, pageSize = 10 } = examHistoryDto;

    // First verify the student exists and belongs to the batch
    const student = await this.studentRepository.findOne({
      where: { id: studentId, batch: { id: batchId } },
      relations: ['batch'],
    });

    if (!student) {
      return {
        isSuccessful: false,
        message: 'Student not found or does not belong to the specified batch',
        listContent: [],
      };
    }

    // Get total count of exams for the batch
    const totalItems = await this.examsRepository.count({
      where: { batch: { id: batchId } },
    });

    if (totalItems === 0) {
      return {
        isSuccessful: true,
        message: 'No exams found for this batch',
        listContent: [],
      };
    }

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (page - 1) * pageSize;

    // Get paginated exams for the batch
    const exams = await this.examsRepository.find({
      where: { batch: { id: batchId } },
      relations: [
        'faculty',
        'course',
        'batch',
        'module',
        'lecture',
        'lecture.user',
      ],
      order: { examDate: 'DESC' },
      skip,
      take: pageSize,
    });

    // Get participation status for each exam
    const examHistory = await Promise.all(
      exams.map(async (exam) => {
        const participant = await this.examParticipantRepository.findOne({
          where: { exam: { id: exam.id }, student: { id: studentId } },
        });

        return {
          examId: exam.id,
          examName: exam.examName,
          examCode: exam.examCode,
          examDate: exam.examDate,
          startTime: exam.startTime,
          endTime: exam.endTime,
          status: exam.status,
          faculty: exam.faculty?.name,
          course: exam.course?.name,
          module: exam.module?.name,
          lecture: exam.lecture?.user?.name,
          hasParticipated: !!participant,
          joinedAt: participant?.joinedAt,
          isSubmitted: participant?.isSubmitted || false,
          submittedAt: participant?.submittedAt,
          isConnected: participant?.isConnected || false,
          disconnectedAt: participant?.disconnectedAt,
        };
      }),
    );

    const paginationInfo: PaginationInfo = {
      page,
      pageSize,
      totalItems,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };

    return {
      isSuccessful: true,
      message: 'Exam history fetched successfully',
      listContent: examHistory,
      paginationInfo,
    };
  }

  //get comprehensive exam report for admin
  async getExamReport(
    examReportDto: ExamReportDto,
  ): Promise<ResponseContent<any>> {
    const { examId } = examReportDto;

    // Get exam details with all relations
    const exam = await this.examsRepository.findOne({
      where: { id: examId },
      relations: [
        'faculty',
        'course',
        'batch',
        'module',
        'lecture',
        'lecture.user',
        'examQuestions',
        'examQuestions.answerOptions',
      ],
    });

    if (!exam) {
      return {
        isSuccessful: false,
        message: 'Exam not found',
        content: null,
      };
    }

    // Check if exam has ended
    const now = new Date();
    const examEndTime = new Date(exam.endTime);
    if (now < examEndTime) {
      return {
        isSuccessful: false,
        message:
          'Exam has not ended yet. Report will be available after exam ends.',
        content: null,
      };
    }

    // Get all participants for this exam
    const participants = await this.examParticipantRepository.find({
      where: { exam: { id: examId } },
      relations: ['student', 'student.user'],
    });

    // Get all students in the batch to see who didn't participate
    const allBatchStudents = await this.studentRepository.find({
      where: { batch: { id: exam.batch.id } },
      relations: ['user'],
    });

    // Get all violations for this exam
    const violations = await this.examViolationRepository.find({
      where: { exam: { id: examId } },
      relations: ['student', 'student.user'],
    });

    // Get all answers for this exam
    const answers = await this.examAnswerRepository.find({
      where: { exam: { id: examId } },
      relations: ['student', 'student.user', 'question'],
    });

    // Process participants data
    const participantsData = participants.map((participant) => {
      const studentViolations = violations.filter(
        (v) => v.student.id === participant.student.id,
      );
      const studentAnswers = answers.filter(
        (a) => a.student.id === participant.student.id,
      );

      return {
        studentId: participant.student.id,
        studentName: participant.student.user?.name,
        studentEmail: participant.student.user?.email,
        studentIdNumber: participant.student.studentId,
        hasParticipated: true,
        joinedAt: participant.joinedAt,
        isSubmitted: participant.isSubmitted,
        submittedAt: participant.submittedAt,
        isConnected: participant.isConnected,
        disconnectedAt: participant.disconnectedAt,
        totalQuestions: exam.examQuestions.length,
        answeredQuestions: studentAnswers.length,
        violations: studentViolations.map((v) => ({
          id: v.id,
          violationType: v.violationType,
          count: v.count,
          violationTimestamp: v.violationTimestamp,
          description: v.description,
          status: v.status,
          webcamScreenshotPath: v.webcamScreenshotPath,
          screenScreenshotPath: v.screenScreenshotPath,
        })),
        answers: studentAnswers.map((a) => ({
          questionId: a.question.id,
          questionText: a.question.text,
          questionType: a.question.type,
          answer: a.answer,
          timeTaken: a.timeTaken,
          isCorrect: a.isCorrect,
          submittedAt: a.submittedAt,
        })),
      };
    });

    // Find students who didn't participate
    const participatedStudentIds = participants.map((p) => p.student.id);
    const nonParticipants = allBatchStudents.filter(
      (student) => !participatedStudentIds.includes(student.id),
    );

    const nonParticipantsData = nonParticipants.map((student) => ({
      studentId: student.id,
      studentName: student.user?.name,
      studentEmail: student.user?.email,
      studentIdNumber: student.studentId,
      hasParticipated: false,
      joinedAt: null,
      isSubmitted: false,
      submittedAt: null,
      isConnected: false,
      disconnectedAt: null,
      totalQuestions: exam.examQuestions.length,
      answeredQuestions: 0,
      violations: [],
      answers: [],
    }));

    // Combine all students
    const allStudentsData = [...participantsData, ...nonParticipantsData];

    // Calculate statistics
    const totalStudents = allStudentsData.length;
    const participatedCount = participantsData.length;
    const submittedCount = participantsData.filter((p) => p.isSubmitted).length;
    const totalViolations = violations.length;
    const totalAnswers = answers.length;

    const report = {
      examDetails: {
        id: exam.id,
        examName: exam.examName,
        examCode: exam.examCode,
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        status: exam.status,
        faculty: exam.faculty?.name,
        course: exam.course?.name,
        batch: exam.batch?.batchCode,
        module: exam.module?.name,
        lecture: exam.lecture?.user?.name,
        totalQuestions: exam.examQuestions.length,
        examMode: exam.examMode,
        description: exam.description,
      },
      statistics: {
        totalStudents,
        participatedCount,
        participationRate:
          ((participatedCount / totalStudents) * 100).toFixed(2) + '%',
        submittedCount,
        submissionRate:
          ((submittedCount / participatedCount) * 100).toFixed(2) + '%',
        totalViolations,
        totalAnswers,
        averageAnswersPerStudent:
          participatedCount > 0
            ? (totalAnswers / participatedCount).toFixed(2)
            : '0',
      },
      questions: exam.examQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        category: q.category,
        answerOptions: q.answerOptions,
      })),
      students: allStudentsData,
      violations: violations.map((v) => ({
        id: v.id,
        studentId: v.student.id,
        studentName: v.student.user?.name,
        studentIdNumber: v.student.studentId,
        violationType: v.violationType,
        count: v.count,
        violationTimestamp: v.violationTimestamp,
        description: v.description,
        status: v.status,
        reviewedBy: v.reviewedBy,
        reviewedAt: v.reviewedAt,
        adminNotes: v.adminNotes,
        webcamScreenshotPath: v.webcamScreenshotPath,
        screenScreenshotPath: v.screenScreenshotPath,
      })),
    };

    return {
      isSuccessful: true,
      message: 'Exam report generated successfully',
      content: report,
    };
  }
}
