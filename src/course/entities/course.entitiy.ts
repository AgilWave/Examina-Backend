import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Student } from '../../user/entities/student.entitiy';
import { Faculty } from '../../faulty/entities/faculty.entitiy';
import { Lecture } from '../../user/entities/lecture.entitiy';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Faculty, { nullable: true })
  faculty: Faculty;

  @Column({ nullable: true })
  facultyId: number;
  
  @Column({ nullable: true })
  facultyName: string

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

  @OneToMany(() => Student, (student) => student.course)
  students: Student[];

  @OneToMany(() => Lecture, (lecture) => lecture.courses)
  lectures: Lecture[];
}
