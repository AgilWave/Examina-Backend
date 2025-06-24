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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('lectures')
export class Lecture {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Lecture ID',
    type: Number,
  })
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'User ID',
    type: Number,
  })
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
  @ApiPropertyOptional({
    description: 'Faculties',
    type: () => Faculty,
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
  @ApiPropertyOptional({
    description: 'Courses',
    type: () => Course,
  })
  courses: Course[];

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'Created by',
    type: String,
  })
  createdBy: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'Updated by',
    type: String,
  })
  updatedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiPropertyOptional({
    description: 'Created at',
    type: Date,
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @ApiPropertyOptional({
    description: 'Updated at',
    type: Date,
  })
  updatedAt: Date;
}
