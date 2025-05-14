import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exams } from './entities/exams.entitiy';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { ExamFilterDto } from './dto/filter.dto';
import { CreateExamDTO } from './dto/exams.dto';
import { User } from '../user/entities/user.entitiy';
import { ResponseContent } from 'src/response-dtos/responseContent.dto';
import { ExamQuestion } from './entities/examquestions.entity';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exams)
    private readonly examRepository: Repository<Exams>,
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
      examQuestions: examQuestions,
    });

    if (currentUser) {
      newExam.createdBy = currentUser.username;
    } else {
      newExam.createdBy = 'System';
    }

    const savedExam = await this.examRepository.save(newExam);

    return {
      isSuccessful: true,
      message: 'Exams created successfully',
      content: savedExam,
    };
  }

  async findAll(filterDto: ExamFilterDto): Promise<ResponseList<Exams>> {
    const { page = 1, pageSize = 10, examName, status } = filterDto;
    const query = this.examRepository.createQueryBuilder('exam');

    if (examName) {
      query.andWhere('exam.examName ILIKE :examName', {
        examName: `%${examName}%`,
      });
    }

    if (status) {
      query.andWhere('exam.status = :status', { status });
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
}
