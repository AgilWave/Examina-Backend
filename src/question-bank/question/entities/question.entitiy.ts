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

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column()
  type: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text', nullable: true })
  @Optional()
  attachment: string;

  @ManyToOne(() => Modules, (module) => module.questions)
  module: Modules;

  @OneToMany(() => AnswerOption, (option) => option.question, { cascade: true })
  @Optional()
  answerOptions: AnswerOption[] | null;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updatedAt: Date;
  isActive: boolean;
}
