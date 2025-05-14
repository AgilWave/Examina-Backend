import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from '../../user/entities/student.entitiy';
import { Lecture } from '../../user/entities/lecture.entitiy';
import { Modules } from '../../modules/entities/modules.entitiy';
import { Course } from '../../course/entities/course.entitiy';
import { Exams } from 'src/exams/entities/exams.entitiy';
@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

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

  @OneToMany(() => Course, (course) => course.faculty)
  courses: Course[];

  @OneToMany(() => Student, (student) => student.faculty)
  students: Student[];

  @OneToMany(() => Lecture, (lecture) => lecture.faculties)
  lectures: Lecture[];

  @OneToMany(() => Modules, (module) => module.faculty)
  modules: Modules[];
}
