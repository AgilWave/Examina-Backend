import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entitiy';

@Entity('answer_option')
export class AnswerOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ nullable: true })
  clarification: string;

  @Column()
  isCorrect: boolean;

  @ManyToOne(() => Question, (question) => question.answerOptions, {
    onDelete: 'CASCADE',
  })
  question: Question;
}
