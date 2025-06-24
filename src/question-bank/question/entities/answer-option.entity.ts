import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entitiy';
import { ApiProperty } from '@nestjs/swagger';
@Entity('answer_option')
export class AnswerOption {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Answer option ID',
    type: Number,
  })
  id: number;

  @Column()
  @ApiProperty({
    description: 'Answer option text',
    type: String,
  })
  text: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Answer option clarification',
    type: String,
  })
  clarification: string;

  @Column()
  @ApiProperty({
    description: 'Answer option is correct',
    type: Boolean,
  })
  isCorrect: boolean;

  @ManyToOne(() => Question, (question) => question.answerOptions, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({
    description: 'Answer option question',
    type: () => Question,
  })
  question: Question;
}
