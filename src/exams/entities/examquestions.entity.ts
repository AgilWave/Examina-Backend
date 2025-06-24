import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exams } from './exams.entitiy';
import { ExamAnswerOption } from './answer-option.entity';
import { ExamAnswer } from './exam-answers.entity';

@Entity('exam_questions')
export class ExamQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exams, (exam) => exam.examQuestions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examId' })
  exam: Exams;

  @Column()
  type: string;

  @Column()
  category: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ nullable: true, type: 'text' })
  attachment: string;

  @OneToMany(() => ExamAnswerOption, (option) => option.examQuestion, {
    cascade: true,
    eager: true,
  })
  answerOptions: ExamAnswerOption[];

  @OneToMany(() => ExamAnswer, (answer) => answer.question, {
    cascade: true,
  })
  examAnswers: ExamAnswer[];

  @Column()
  createdBy: string;
}
