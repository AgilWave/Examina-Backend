import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ResponseContent } from 'src/response-dtos/responseContent.dto';
import { Student } from '../user/entities/student.entitiy';
import { ExamParticipant } from '../exams/entities/exam-participants.entity';
import { Exams } from 'src/exams/entities/exams.entitiy';
import { ExamAnswer } from 'src/exams/entities/exam-answers.entity';
import { ExamQuestion } from 'src/exams/entities/examquestions.entity';

export interface ExamAnswerSubmission {
  examId: number;
  questionId: number;
  answer: string;
  timeTaken?: number;
  isCorrect?: boolean;
}

export interface ParticipantStatus {
  hasJoined: boolean;
  joinedAt: string;
  isConnected: boolean;
  disconnectedAt?: string;
}
@Injectable()
export class ExamAnswerService {
  constructor(
    @InjectRepository(ExamParticipant)
    private readonly examParticipantRepository: Repository<ExamParticipant>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
    @InjectRepository(ExamQuestion)
    private examQuestionRepository: Repository<ExamQuestion>,
    @InjectRepository(ExamAnswer)
    private examAnswerRepository: Repository<ExamAnswer>,
  ) {}

  async submitExamAnswers(
    submissions: ExamAnswerSubmission[],
  ): Promise<ResponseContent<ExamAnswer>> {
    if (!submissions || submissions.length === 0) {
      throw new BadRequestException('No answers provided');
    }

    const examId = submissions[0].examId;
    // TODO: Extract studentId from JWT token in real implementation
    const studentId = 1; // This should be extracted from JWT token in real implementation

    if (!submissions.every((sub) => sub.examId === examId)) {
      throw new BadRequestException('All answers must be for the same exam');
    }

    const exam = await this.examsRepository.findOne({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const questionIds = submissions.map((sub) => sub.questionId);
    const questions = await this.examQuestionRepository.find({
      where: { id: In(questionIds) },
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestException('Some questions not found');
    }

    const savedAnswers: ExamAnswer[] = [];

    for (const submission of submissions) {
      // Check if answer already exists
      const existingAnswer = await this.examAnswerRepository.findOne({
        where: {
          exam: { id: examId },
          student: { id: studentId },
          question: { id: submission.questionId },
        },
      });

      if (existingAnswer) {
        // Update existing answer
        existingAnswer.answer = submission.answer;
        if (submission.timeTaken !== undefined) {
          existingAnswer.timeTaken = submission.timeTaken;
        }
        if (submission.isCorrect !== undefined) {
          existingAnswer.isCorrect = submission.isCorrect;
        }
        existingAnswer.submittedAt = new Date();

        const updatedAnswer =
          await this.examAnswerRepository.save(existingAnswer);
        savedAnswers.push(updatedAnswer);
      } else {
        // Create new answer
        const newAnswer = this.examAnswerRepository.create({
          exam: { id: examId },
          student: { id: studentId },
          question: { id: submission.questionId },
          answer: submission.answer,
          timeTaken: submission.timeTaken,
          isCorrect: submission.isCorrect,
          submittedAt: new Date(),
        });

        const savedAnswer = await this.examAnswerRepository.save(newAnswer);
        savedAnswers.push(savedAnswer);
      }
    }

    return {
      isSuccessful: true,
      message: 'Exam answers submitted successfully',
      content: savedAnswers,
    };
  }
}
