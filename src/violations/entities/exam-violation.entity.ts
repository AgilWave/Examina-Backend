import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Exams } from '../../exams/entities/exams.entitiy';
import { Student } from '../../user/entities/student.entitiy';

@Entity('exam_violations')
export class ExamViolation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examId' })
  exam: Exams;

  @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: false })
  violationType: string;

  @Column({ nullable: false })
  count: number;

  @Column({ nullable: true })
  socketId: string;

  @Column({ type: 'timestamp', nullable: true })
  violationTimestamp: Date;

  @Column({ nullable: true })
  webcamScreenshotPath: string;

  @Column({ nullable: true })
  screenScreenshotPath: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'pending' })
  status: string; // pending, reviewed, resolved, dismissed

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
