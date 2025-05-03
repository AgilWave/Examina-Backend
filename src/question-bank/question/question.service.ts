import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { ResponseContent } from '../../response-dtos/responseContent.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { QuestionFilterDTO } from './dto/filter.dto';
import { User } from '../../user/entities/user.entitiy';
import { Question } from './entities/question.entitiy';
import { CreateQuestionBatchDto } from './dto/create-question-batch.dto';
import { Modules } from '../../modules/entities/modules.entitiy';
import { AnswerOption } from './entities/answer-option.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
    @InjectRepository(AnswerOption)
    private readonly answerOptionRepository: Repository<AnswerOption>,
  ) {}

  async create(
    createQuestionDTO: CreateQuestionBatchDto,
    currentUser?: User,
  ): Promise<ResponseContent<Question>> {
    const existingQuestions = await this.questionRepository.find({
      where: {
        text: In(createQuestionDTO.questions.map((q) => q.text)),
      },
    });
    if (existingQuestions.length > 0) {
      return {
        isSuccessful: false,
        message: 'One or more questions already exist',
        content: null,
      };
    }
    const module = await this.moduleRepository.findOne({
      where: { id: createQuestionDTO.moduleId },
    });

    if (!module) {
      return {
        isSuccessful: false,
        message: 'Module not found',
        content: null,
      };
    }

    const createdQuestions: Question[] = [];

    for (const q of createQuestionDTO.questions) {
      const question = this.questionRepository.create({
        text: q.text,
        category: q.category,
        type: q.type,
        attachment: q.attachment,
        module: module,
        createdBy: currentUser ? currentUser.username : 'System',
        answerOptions: q.answerOptions
          ? q.answerOptions.map((opt) =>
              this.answerOptionRepository.create({
                text: opt.text,
                clarification: opt.clarification,
                isCorrect: opt.isCorrect,
              }),
            )
          : [],
      });
      await this.questionRepository.save(question);
      createdQuestions.push(question);
    }

    return {
      isSuccessful: true,
      message: 'Questions created successfully',
      content: createdQuestions,
    };
  }

  async findById(id: number): Promise<ResponseContent<Question>> {
    const question = await this.questionRepository.findOne({
      where: { id },
    });

    if (!question) {
      return {
        isSuccessful: false,
        message: 'Question not found',
        content: null,
      };
    }

    return {
      isSuccessful: true,
      message: 'Question found',
      content: question,
    };
  }

  async findAll(filterDto: QuestionFilterDTO): Promise<ResponseList<Question>> {
    const { page = 1, pageSize = 10, name, moduleId, createdBy } = filterDto;
    const query = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.module', 'module')
      .leftJoinAndSelect('question.answerOptions', 'answerOptions')
      .select([
        'question',
        'module.name',
        'answerOptions.id',
        'answerOptions.text',
        'answerOptions.clarification',
        'answerOptions.isCorrect',
      ]);

    if (name) {
      query.andWhere('question.name ILIKE :name', { name: `%${name}%` });
    }

    if (moduleId) {
      query.andWhere('question.moduleId = :moduleId', { moduleId });
    }

    if (createdBy) {
      query.andWhere('question.createdBy = :createdBy', { createdBy });
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('question.createdAt', 'DESC');

    const questions = await query.getMany();

    if (questions.length === 0) {
      return {
        isSuccessful: false,
        message: 'No Questions found',
        listContent: [],
      };
    }

    questions.forEach((question) => {
      if (!question.answerOptions || question.answerOptions.length === 0) {
        question.answerOptions = null;
      }
    });

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
      message: 'Questions found',
      listContent: questions,
      paginationInfo,
    };
  }

  // async update(
  //   id: number,
  //   updateQuestionDto: UpdateQuestionsDTO,
  //   currentUser?: User,
  // ): Promise<ResponseContent<Questions>> {
  //   const question = await this.questionRepository.findOne({
  //     where: { id },
  //   });

  //   if (!question) {
  //     return {
  //       isSuccessful: false,
  //       message: 'Question not found',
  //       content: null,
  //     };
  //   }

  //   const updatedQuestion = Object.assign(question, updateQuestionDto);

  //   if (currentUser) {
  //     updatedQuestion.updatedBy = currentUser.username;
  //   } else {
  //     updatedQuestion.updatedBy = 'System';
  //   }

  //   const savedQuestion = await this.questionRepository.save(updatedQuestion);

  //   return {
  //     isSuccessful: true,
  //     message: 'Question updated successfully',
  //     content: savedQuestion,
  //   };
  // }

  // async updateStatus(
  //   id: number,
  //   isActive: boolean,
  //   currentUser?: User,
  // ): Promise<ResponseContent<Questions>> {
  //   const question = await this.questionRepository.findOne({
  //     where: { id },
  //   });

  //   if (!question) {
  //     return {
  //       isSuccessful: false,
  //       message: 'Question not found',
  //       content: null,
  //     };
  //   }

  //   question.isActive = isActive;

  //   if (currentUser) {
  //     question.updatedBy = currentUser.username;
  //   } else {
  //     question.updatedBy = 'System';
  //   }

  //   const updatedquestion = await this.questionRepository.save(question);

  //   return {
  //     isSuccessful: true,
  //     message: `Question ${isActive ? 'activated' : 'deactivated'} successfully`,
  //     content: updatedquestion,
  //   };
  // }
}
