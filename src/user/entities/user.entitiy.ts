import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Student } from './student.entitiy';
import { Lecture } from './lecture.entitiy';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'User ID',
    type: Number,
  })
  id: number;

  @Column({ unique: true })
  @ApiProperty({
    description: 'User email',
    type: String,
  })
  email: string;

  @Column()
  @ApiProperty({
    description: 'User name',
    type: String,
  })
  name: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'User microsoft ID',
    type: String,
  })
  microsoftId: string;

  @Column({
    type: 'enum',
    enum: ['student', 'lecturer', 'admin', 'superAdmin'],
    default: 'student',
  })
  @ApiProperty({
    description: 'User role',
    enum: ['student', 'lecturer', 'admin', 'superAdmin'],
    enumName: 'UserRole',
  })
  role: string;

  @Column({ unique: true, nullable: true })
  @ApiPropertyOptional({
    description: 'User username',
    type: String,
  })
  username: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'User password',
    type: String,
  })
  password: string;

  @Column({ default: false })
  @ApiPropertyOptional({
    description: 'User is blacklisted',
    type: Boolean,
  })
  isBlacklisted: boolean;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'User blacklisted reason',
    type: String,
  })
  blacklistedReason: string;

  @Column({ default: 0 })
  @ApiPropertyOptional({
    description: 'User failed login attempts',
    type: Number,
  })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({
    description: 'User last failed login attempt',
    type: Date,
  })
  lastFailedLoginAttempt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({
    description: 'User last login',
    type: Date,
  })
  lastLogin: Date;

  @CreateDateColumn()
  @ApiPropertyOptional({
    description: 'User created at',
    type: Date,
  })
  createdAt: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'User created by',
    type: String,
  })
  createdBy: string;

  @UpdateDateColumn()
  @ApiPropertyOptional({
    description: 'User updated at',
    type: Date,
  })
  updatedAt: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'User updated by',
    type: String,
  })
  updatedBy: string;

  @Column({ default: true })
  @ApiPropertyOptional({
    description: 'User is first login',
    type: Boolean,
  })
  isFirstLogin: boolean;

  @OneToOne(() => Student, (student) => student.user)
  @ApiPropertyOptional({
    description: 'User student',
    type: () => Student,
  })
  student: Student;

  @OneToOne(() => Lecture, (lecture) => lecture.user)
  @ApiPropertyOptional({
    description: 'User lecture',
    type: () => Lecture,
  })
  lecture: Lecture;
}
