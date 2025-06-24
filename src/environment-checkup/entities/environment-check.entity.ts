import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('environment_checks')
@Index(['examId', 'studentId'])
export class EnvironmentCheck {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @Column()
  examId: string;

  @Column()
  studentId: string;

  @Column()
  videoUrl: string;

  @Column()
  blobName: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({ type: 'timestamp' })
  uploadTimestamp: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
