import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Exams } from './exams.entitiy';
import { Student } from '../../user/entities/student.entitiy';
import { ExamQuestion } from './examquestions.entity';

@Entity('exam_answers')
export class ExamAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exams, (exam) => exam.examAnswers, { onDelete: 'CASCADE' })
  exam: Exams;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => ExamQuestion, (question) => question.examAnswers, {
    onDelete: 'CASCADE',
  })
  question: ExamQuestion;

  @Column('text')
  answer: string; // Can store the answer as text or store serialized JSON for multiple choice, etc.

  @Column({ nullable: true })
  timeTaken: number; // Time spent on the question in seconds

  @Column({ nullable: true })
  isCorrect: boolean; // Optional, for marking correctness of the answer

  @CreateDateColumn()
  submittedAt: Date;
}
