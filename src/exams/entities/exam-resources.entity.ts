import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Exams } from './exams.entitiy';
import { Student } from '../../user/entities/student.entitiy';

@Entity('exam_resources')
export class ExamResource {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exams, (exam) => exam.examResources, {
    onDelete: 'CASCADE',
  })
  exam: Exams;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @Column()
  resourceType: 'screen' | 'mic' | 'environment';

  @Column()
  blobUrl: string;
  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  fileSize: number; 

  @CreateDateColumn()
  uploadedAt: Date;
}
