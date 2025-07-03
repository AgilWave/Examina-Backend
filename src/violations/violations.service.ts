import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamViolation } from './entities/exam-violation.entity';
import { CreateViolationDTO } from './dto/create-violation.dto';
import { ViolationFilterDto } from './dto/filter.dto';
import { ResponseList } from '../response-dtos/responseList.dto';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { PaginationInfo } from '../response-dtos/pagination-response.dto';
import { Exams } from '../exams/entities/exams.entitiy';
import { Student } from '../user/entities/student.entitiy';

@Injectable()
export class ViolationsService {
  constructor(
    @InjectRepository(ExamViolation)
    private readonly violationRepository: Repository<ExamViolation>,
    @InjectRepository(Exams)
    private readonly examRepository: Repository<Exams>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(
    createViolationDTO: CreateViolationDTO,
  ): Promise<ResponseContent<ExamViolation>> {
    // Check if exam exists
    const exam = await this.examRepository.findOne({
      where: { examCode: createViolationDTO.examId },
    });

    if (!exam) {
      return {
        isSuccessful: false,
        message: 'Exam not found',
        content: null,
      };
    }

    // Check if student exists
    const student = await this.studentRepository.findOne({
      where: { studentId: createViolationDTO.studentId },
    });

    if (!student) {
      return {
        isSuccessful: false,
        message: 'Student not found',
        content: null,
      };
    }

    const newViolation = this.violationRepository.create({
      exam: { id: exam.id },
      student: { id: student.id },
      violationType: createViolationDTO.violationType,
      count: createViolationDTO.count,
      socketId: createViolationDTO.socketId,
      violationTimestamp: createViolationDTO.violationTimestamp
        ? new Date(createViolationDTO.violationTimestamp)
        : new Date(),
      webcamScreenshotPath: createViolationDTO.webcamScreenshotPath,
      screenScreenshotPath: createViolationDTO.screenScreenshotPath,
      description: createViolationDTO.description,
    });

    const savedViolation = await this.violationRepository.save(newViolation);

    return {
      isSuccessful: true,
      message: 'Violation recorded successfully',
      content: savedViolation,
    };
  }

  async findAll(
    filterDto: ViolationFilterDto,
  ): Promise<ResponseList<ExamViolation>> {
    const {
      page = 1,
      pageSize = 10,
      examId,
      studentId,
      violationType,
      status,
      reviewedBy,
    } = filterDto;

    const query = this.violationRepository
      .createQueryBuilder('violation')
      .leftJoinAndSelect('violation.exam', 'exam')
      .leftJoinAndSelect('violation.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('violation.isDeleted = :isDeleted', { isDeleted: false });

    if (examId) {
      query.andWhere('exam.examCode = :examId', { examId });
    }

    if (studentId) {
      query.andWhere('student.studentId = :studentId', { studentId });
    }

    if (violationType) {
      query.andWhere('violation.violationType ILIKE :violationType', {
        violationType: `%${violationType}%`,
      });
    }

    if (status) {
      query.andWhere('violation.status = :status', { status });
    }

    if (reviewedBy) {
      query.andWhere('violation.reviewedBy ILIKE :reviewedBy', {
        reviewedBy: `%${reviewedBy}%`,
      });
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('violation.createdAt', 'DESC');

    const violations = await query.getMany();

    if (violations.length === 0) {
      return {
        isSuccessful: false,
        message: 'No violations found',
        listContent: [],
      };
    }

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
      message: 'Violations found',
      listContent: violations,
      paginationInfo,
    };
  }

  async findById(id: number): Promise<ResponseContent<ExamViolation>> {
    const violation = await this.violationRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['exam', 'student', 'student.user'],
    });

    if (!violation) {
      return {
        isSuccessful: false,
        message: 'Violation not found',
        content: null,
      };
    }

    return {
      isSuccessful: true,
      message: 'Violation found',
      content: violation,
    };
  }

  async updateStatus(
    id: number,
    status: string,
    reviewedBy: string,
    adminNotes?: string,
  ): Promise<ResponseContent<ExamViolation>> {
    const violation = await this.violationRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!violation) {
      return {
        isSuccessful: false,
        message: 'Violation not found',
        content: null,
      };
    }

    violation.status = status;
    violation.reviewedBy = reviewedBy;
    violation.reviewedAt = new Date();
    violation.adminNotes = adminNotes || '';

    const updatedViolation = await this.violationRepository.save(violation);

    return {
      isSuccessful: true,
      message: 'Violation status updated successfully',
      content: updatedViolation,
    };
  }

  async delete(id: number): Promise<ResponseContent<null>> {
    const violation = await this.violationRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!violation) {
      return {
        isSuccessful: false,
        message: 'Violation not found',
        content: null,
      };
    }

    violation.isDeleted = true;
    await this.violationRepository.save(violation);

    return {
      isSuccessful: true,
      message: 'Violation deleted successfully',
      content: null,
    };
  }

  async getViolationsByExam(
    examId: string,
  ): Promise<ResponseList<ExamViolation>> {
    const violations = await this.violationRepository
      .createQueryBuilder('violation')
      .leftJoinAndSelect('violation.exam', 'exam')
      .leftJoinAndSelect('violation.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('exam.examCode = :examId', { examId })
      .andWhere('violation.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('violation.createdAt', 'DESC')
      .getMany();

    if (violations.length === 0) {
      return {
        isSuccessful: false,
        message: 'No violations found for this exam',
        listContent: [],
      };
    }

    return {
      isSuccessful: true,
      message: 'Violations found for exam',
      listContent: violations,
    };
  }

  async getViolationsByStudent(
    studentId: string,
  ): Promise<ResponseList<ExamViolation>> {
    const violations = await this.violationRepository
      .createQueryBuilder('violation')
      .leftJoinAndSelect('violation.exam', 'exam')
      .leftJoinAndSelect('violation.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('student.studentId = :studentId', { studentId })
      .andWhere('violation.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('violation.createdAt', 'DESC')
      .getMany();

    if (violations.length === 0) {
      return {
        isSuccessful: false,
        message: 'No violations found for this student',
        listContent: [],
      };
    }

    return {
      isSuccessful: true,
      message: 'Violations found for student',
      listContent: violations,
    };
  }
}
