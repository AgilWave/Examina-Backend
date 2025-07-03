import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Student } from '../../user/entities/student.entitiy';
import { Modules } from '../../modules/entities/modules.entitiy';
import { Lecture } from '../../user/entities/lecture.entitiy';
import { Faculty } from '../../faulty/entities/faculty.entitiy';
import { ApiProperty } from '@nestjs/swagger';
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Course ID',
    type: Number,
  })
  id: number;

  @Column()
  @ApiProperty({
    description: 'Course name',
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
    description: 'Course is active',
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

  @ManyToOne(() => Faculty, (faculty) => faculty.courses)
  faculty: Faculty;

  @OneToMany(() => Student, (student) => student.course)
  @ApiProperty({
    description: 'Students',
    type: () => Student,
  })
  students: Student[];

  @OneToMany(() => Lecture, (lecture) => lecture.courses)
  @ApiProperty({
    description: 'Lectures',
    type: () => Lecture,
  })
  lectures: Lecture[];

  @ManyToMany(() => Modules, (module) => module.courses)
  @JoinTable({ name: 'course_modules' })
  modules: Modules[];
}
