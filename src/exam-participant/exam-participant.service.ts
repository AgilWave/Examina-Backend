import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseContent } from 'src/response-dtos/responseContent.dto';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { Student } from '../user/entities/student.entitiy';
import { ExamParticipant } from '../exams/entities/exam-participants.entity';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { JoinExamDto } from './dto/join-exam.dto';
import { UpdateConnectionStatusDto } from './dto/update-connection-status.dto';
import { Exams } from 'src/exams/entities/exams.entitiy';

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
}
