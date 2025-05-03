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

@Entity('modules')
export class Modules {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  facultyId: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToMany(() => Course, (course) => course.modules)
  courses: Course[];

  @ManyToOne(() => Faculty, (faculty) => faculty.modules)
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @OneToMany(() => Question, (question) => question.module)
  questions: Question[];
}
