import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from '../../user/entities/student.entitiy';
import { Lecture } from '../../user/entities/lecture.entitiy';
import { Modules } from '../../modules/entities/modules.entitiy';
import { Course } from '../../course/entities/course.entitiy';
// import { Exams } from 'src/exams/entities/exams.entitiy';
import { ApiProperty } from '@nestjs/swagger';
@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Faculty ID',
    type: Number,
  })
  id: number;

  @Column({ unique: true })
  @ApiProperty({
    description: 'Faculty name',
    type: String,
  })
  name: string;

  @Column({ default: true })
  @ApiProperty({
    description: 'Faculty is active',
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

  @OneToMany(() => Course, (course) => course.faculty)
  @ApiProperty({
    description: 'Courses',
    type: () => Course,
  })
  courses: Course[];

  @OneToMany(() => Student, (student) => student.faculty)
  @ApiProperty({
    description: 'Students',
    type: () => Student,
  })
  students: Student[];

  @OneToMany(() => Lecture, (lecture) => lecture.faculties)
  @ApiProperty({
    description: 'Lectures',
    type: () => Lecture,
  })
  lectures: Lecture[];

  @OneToMany(() => Modules, (module) => module.faculty)
  @ApiProperty({
    description: 'Modules',
    type: () => Modules,
  })
  modules: Modules[];
}
