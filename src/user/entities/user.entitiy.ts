import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Student } from './student.entitiy';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  microsoftId: string;

  @Column({
    type: 'enum',
    enum: ['student', 'lecturer', 'admin', 'superAdmin'],
    default: 'student',
  })
  role: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  isBlacklisted: boolean;

  @Column({ nullable: true })
  blacklistedReason: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastFailedLoginAttempt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ default: true })
  isFirstLogin: boolean;

  @OneToOne(() => Student, (student) => student.user)
  student: Student;
}
