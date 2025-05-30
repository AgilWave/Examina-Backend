import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Exams } from './exams.entitiy';
import { Student } from '../../user/entities/student.entitiy';

@Entity('exam_participants')
export class ExamParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exams, (exam) => exam.examParticipants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'examId' })
  exam: Exams;

  @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ default: true })
  isConnected: boolean;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  disconnectedAt: Date;
}
