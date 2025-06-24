import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { AnswerOption } from './answer-option.entity';
import { Modules } from 'src/modules/entities/modules.entitiy';
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
@Entity('question')
export class Question {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Question ID',
    type: Number,
  })
  id: number;

  @Column()
  @ApiProperty({
    description: 'Question category',
    type: String,
  })
  category: string;

  @Column()
  @ApiProperty({
    description: 'Question type',
    type: String,
  })
  type: string;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'Question text',
    type: String,
  })
  text: string;

  @Column({ type: 'text', nullable: true })
  @Optional()
  @ApiProperty({
    description: 'Question attachment',
    type: String,
  })
  attachment: string;

  @ManyToOne(() => Modules, (module) => module.questions)
  @ApiProperty({
    description: 'Question module',
    type: () => Modules,
  })
  module: Modules;

  @OneToMany(() => AnswerOption, (option) => option.question, { cascade: true })
  @Optional()
  @ApiProperty({
    description: 'Question answer options',
    type: () => AnswerOption,
  })
  answerOptions: AnswerOption[] | null;

  @Column()
  @ApiProperty({
    description: 'Question created by',
    type: String,
  })
  createdBy: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Question updated by',
    type: String,
  })
  updatedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({
    description: 'Question created at',
    type: Date,
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updatedAt: Date;

  @Column({ default: true })
  @ApiProperty({
    description: 'Question is active',
    type: Boolean,
  })
  isActive: boolean;
}
