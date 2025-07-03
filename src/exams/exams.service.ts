import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exams } from './entities/exams.entitiy';
import { ResponseList } from '../response-dtos/responseList.dto';
import { PaginationInfo } from '../response-dtos/pagination-response.dto';
import { ExamFilterDto } from './dto/filter.dto';
import { CreateExamDTO } from './dto/exams.dto';
import { User } from '../user/entities/user.entitiy';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { ExamQuestion } from './entities/examquestions.entity';
import { EmailService } from '../email/email.service';
import { Student } from '../user/entities/student.entitiy';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exams)
    private readonly examRepository: Repository<Exams>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly emailService: EmailService,
  ) {}

  async create(
    createExamDTO: CreateExamDTO,
    currentUser?: User,
  ): Promise<ResponseContent<Exams>> {
    const existingExams = await this.examRepository.findOne({
      where: { examCode: createExamDTO.examCode },
    });

    if (existingExams) {
      return {
        isSuccessful: false,
        message: 'Exams already exists',
        content: null,
      };
    }

    const examQuestions = createExamDTO.examQuestions.map((question) => {
      const q = new ExamQuestion();
      q.text = question.text;
      q.type = question.type;
      q.category = question.category;
      q.attachment = question.attachment;
      q.answerOptions = question.answerOptions?.map((opt) => ({
        ...opt,
      }));
      q.createdBy = currentUser ? currentUser.username : 'System';
      return q;
    });

    const newExam = this.examRepository.create({
      ...createExamDTO,
      faculty: { id: createExamDTO.facultyId },
      course: { id: createExamDTO.courseId },
      batch: { id: createExamDTO.batchId },
      module: { id: createExamDTO.moduleId },
      lecture: { id: createExamDTO.lectureId },
      examQuestions: examQuestions,
      startTime: new Date(createExamDTO.startTime),
      endTime: new Date(createExamDTO.endTime),
      examDate: new Date(createExamDTO.examDate),
    });

    if (currentUser) {
      newExam.createdBy = currentUser.username;
    } else {
      newExam.createdBy = 'System';
    }

    const savedExam = await this.examRepository.save(newExam);

    if (savedExam.notifyStudents) {
      try {
        const students = await this.studentRepository.find({
          where: { batch: { id: savedExam.batch.id } },
          relations: ['user'],
        });

        for (const student of students) {
          if (student.user?.email) {
            await this.emailService.sendExamNotification(student.user.email, {
              examName: savedExam.examName,
              examCode: savedExam.examCode,
              batchCode: savedExam.batch.batchCode,
              startTime: savedExam.startTime.toISOString(),
              endTime: savedExam.endTime.toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('Error sending exam notifications:', error);
      }
    }

    return {
      isSuccessful: true,
      message: 'Exams created successfully',
      content: savedExam,
    };
  }

  async findAll(filterDto: ExamFilterDto): Promise<ResponseList<Exams>> {
    const { page = 1, pageSize = 10, examName, status, batchId } = filterDto;
    console.log(filterDto);
    const query = this.examRepository.createQueryBuilder('exam');

    if (examName) {
      query.andWhere('exam.examName ILIKE :examName', {
        examName: `%${examName}%`,
      });
    }

    if (status) {
      query.andWhere('exam.status = :status', { status });
    } else {
      query.andWhere('exam.status IN (:...statuses)', {
        statuses: ['pending', 'active', 'ongoing'],
      });
    }

    if (batchId) {
      query.andWhere('exam.batchId = :batchId', { batchId });
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('exam.createdAt', 'DESC');

    const exams = await query.getMany();

    if (exams.length === 0) {
      return {
        isSuccessful: false,
        message: 'No exams found',
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
      message: 'Exams found',
      listContent: exams,
      paginationInfo,
    };
  }

  async findById(id: number): Promise<ResponseContent<Exams>> {
    const exam = await this.examRepository.findOne({
      where: { id },
    });

    if (!exam) {
      return {
        isSuccessful: false,
        message: 'Exam not found',
        content: null,
      };
    }

    return {
      isSuccessful: true,
      message: 'Exam found',
      content: exam,
    };
  }
}
