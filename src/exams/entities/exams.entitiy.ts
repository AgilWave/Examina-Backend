import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lecture } from '../../user/entities/lecture.entitiy';
import { Modules } from '../../modules/entities/modules.entitiy';
import { Batch } from 'src/batch/entities/batch.entitiy';
import { Course } from '../../course/entities/course.entitiy';
import { Faculty } from 'src/faulty/entities/faculty.entitiy';
import { ExamQuestion } from './examquestions.entity';
import { ExamParticipant } from './exam-participants.entity';
import { ExamResource } from './exam-resources.entity';
import { ExamAnswer } from './exam-answers.entity';

@Entity('exams')
export class Exams {
  @PrimaryGeneratedColumn()
  id: number;

  // Exam Details
  @ManyToOne(() => Faculty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => Batch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  batch: Batch;

  @ManyToOne(() => Modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moduleId' })
  module: Modules;

  @Column({ nullable: false })
  examName: string;

  @Column({ nullable: false, unique: true })
  examCode: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Lecture)
  @JoinColumn({ name: 'lectureId' })
  lecture: Lecture;

  // Schedule Details
  @Column({ nullable: false })
  examDate: Date;

  @Column({ nullable: false })
  startTime: Date;

  @Column({ nullable: false })
  endTime: Date;

  // Exam Type
  @Column({ nullable: false })
  examMode: string;

  @Column({ default: false })
  randomizeQuestions: boolean;

  @Column({ default: false })
  randomizeAnswers: boolean;

  @Column({ default: false })
  allowBackTracking: boolean;

  @Column({ default: false })
  lateEntry: boolean;

  @Column({ nullable: true })
  lateEntryTime: number;

  // Security Settings
  @Column({ default: false })
  webcamRequired: boolean;

  @Column({ default: false })
  micRequired: boolean;

  @Column({ default: false })
  networkStrengthTest: boolean;

  @Column({ default: false })
  lockdownBrowser: boolean;

  @Column({ default: false })
  surroundingEnvironmentCheck: boolean;

  // Question Settings
  @OneToMany(() => ExamQuestion, (eq) => eq.exam, { cascade: true, eager: true })
  examQuestions: ExamQuestion[];

  // Notfication Settings
  @Column({ default: false })
  notifyStudents: boolean;

  @Column({ default: false })
  sendReminders: boolean;

  @Column({ nullable: true })
  reminderTime: number;

  // Additional Settings
  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => ExamParticipant, (ep) => ep.exam, { cascade: true, eager: true })
  examParticipants: ExamParticipant[];

  @OneToMany(() => ExamResource, (er) => er.exam, { cascade: true, eager: true })
  examResources: ExamResource[];

  @OneToMany(() => ExamAnswer, (ea) => ea.exam, { cascade: true, eager: true })
  examAnswers: ExamAnswer[];
}
