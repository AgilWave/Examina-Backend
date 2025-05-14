import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ExamQuestion } from './examquestions.entity';

@Entity('exam_answer_option')
export class ExamAnswerOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ nullable: true })
  clarification: string;

  @Column()
  isCorrect: boolean;

  @Column({ nullable: true })
  mark: number;

  @ManyToOne(() => ExamQuestion, (question) => question.answerOptions, {
    onDelete: 'CASCADE',
  })
  examQuestion: ExamQuestion;
}
