import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exams } from '../entities/exams.entitiy';

@Injectable()
export class ExamStatusScheduler {
  constructor(
    @InjectRepository(Exams)
    private readonly examRepo: Repository<Exams>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExamStatusUpdate(): Promise<void> {
    const now = new Date();

    const exams = await this.examRepo.find();

    for (const exam of exams) {
      if (!exam.startTime || !exam.endTime) {
        continue;
      }
      if (exam.status === 'completed') {
        continue;
      }
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);
      const activeTime = new Date(startTime.getTime() - 10 * 60 * 1000);

      let newStatus = 'pending';

      if (now >= endTime) {
        newStatus = 'completed';
      } else if (now >= activeTime && now < startTime) {
        newStatus = 'active';
      } else if (now >= startTime) {
        newStatus = 'ongoing';
      }

      if (exam.status !== newStatus) {
        exam.status = newStatus;
        await this.examRepo.save(exam);
      }
    }
  }
}
