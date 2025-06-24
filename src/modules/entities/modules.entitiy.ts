import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Course } from '../../course/entities/course.entitiy';
import { Faculty } from '../../faulty/entities/faculty.entitiy';
import { Question } from '../../question-bank/question/entities/question.entitiy';
import { ApiProperty } from '@nestjs/swagger';

@Entity('modules')
export class Modules {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Module ID',
    type: Number,
  })
  id: number;

  @Column({ unique: true })
  @ApiProperty({
    description: 'Module name',
    type: String,
  })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
  })
  facultyId: number;

  @Column({ default: true })
  @ApiProperty({
    description: 'Module is active',
    type: Boolean,
  })
  isActive: boolean;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Created by',
    type: String,
  })
  createdBy: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Updated by',
    type: String,
  })
  updatedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({
    description: 'Created at',
    type: Date,
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({
    description: 'Updated at',
    type: Date,
  })
  updatedAt: Date;

  @ManyToMany(() => Course, (course) => course.modules)
  courses: Course[];

  @ManyToOne(() => Faculty, (faculty) => faculty.modules)
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @OneToMany(() => Question, (question) => question.module)
  @ApiProperty({
    description: 'Questions',
    type: () => Question,
  })
  questions: Question[];
}
