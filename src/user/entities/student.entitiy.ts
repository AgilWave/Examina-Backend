import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entitiy';
import { Faculty } from '../../faulty/entities/faculty.entitiy';
import { Batch } from '../../batch/entities/batch.entitiy';
import { Course } from '../../course/entities/course.entitiy';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => Faculty, { nullable: true })
  faculty: Faculty;

  @Column({ nullable: true })
  facultyId: number;

  @ManyToOne(() => Batch, { nullable: true })
  batch: Batch;

  @Column({ nullable: true })
  batchId: number;

  @ManyToOne(() => Course, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

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
}
