import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  AfterInsert,
  DataSource,
} from 'typeorm';
import { User } from './user.entitiy';
import { Faculty } from '../../faulty/entities/faculty.entitiy';
import { Batch } from '../../batch/entities/batch.entitiy';
import { Course } from '../../course/entities/course.entitiy';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  userId: number;

  @Column({ unique: true, nullable: true })
  @ApiPropertyOptional()
  studentId: string;

  constructor(private dataSource: DataSource) {}

  @AfterInsert()
  async generateStudentId() {
    if (!this.studentId) {
      this.studentId = `KUHDSE241F${String(this.id).padStart(3, '0')}`;
      await this.dataSource.getRepository(Student).update(this.id, {
        studentId: this.studentId,
      });
    }
  }

  @ManyToOne(() => Faculty, { nullable: true })
  faculty: Faculty;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  facultyId: number;

  @ManyToOne(() => Batch, { nullable: true })
  batch: Batch;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  batchId: number;

  @ManyToOne(() => Course, { nullable: true })
  course: Course;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  courseId: number;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  createdBy: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  updatedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiPropertyOptional()
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @ApiPropertyOptional()
  updatedAt: Date;
}
