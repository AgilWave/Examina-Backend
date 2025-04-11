import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entitiy';
import { Faculty } from '../../faulty/entities/faculty.entitiy';
import { Course } from '../../course/entities/course.entitiy';

@Entity('lectures')
export class Lecture {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToMany(() => Faculty, { nullable: true })
  @JoinTable({
    name: 'lecture_faculties',
    joinColumn: {
      name: 'lectureId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'facultyId',
      referencedColumnName: 'id',
    },
  })
  faculties: Faculty[];

  @ManyToMany(() => Course, { nullable: true })
  @JoinTable({
    name: 'lecture_courses',
    joinColumn: {
      name: 'lectureId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'courseId',
      referencedColumnName: 'id',
    },
  })
  courses: Course[];

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
