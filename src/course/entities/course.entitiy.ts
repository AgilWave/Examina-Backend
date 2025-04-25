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
import { Faculty } from 'src/faulty/entities/faculty.entitiy';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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

  @ManyToOne(() => Faculty, (faculty) => faculty.courses)
  faculty: Faculty;

  @OneToMany(() => Student, (student) => student.course)
  students: Student[];

  @OneToMany(() => Lecture, (lecture) => lecture.courses)
  lectures: Lecture[];

  @ManyToMany(() => Modules, (module) => module.courses)
  @JoinTable({ name: 'course_modules' })
  modules: Modules[];
}
