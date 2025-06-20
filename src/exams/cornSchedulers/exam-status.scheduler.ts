import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Exams } from '../entities/exams.entitiy';
import { toZonedTime } from 'date-fns-tz';
import { addMinutes } from 'date-fns';
import { EmailService } from '../../email/email.service';
import { Student } from '../../user/entities/student.entitiy';

const SRI_LANKA_TZ = 'Asia/Colombo';

@Injectable()
export class ExamStatusScheduler {
  constructor(
    @InjectRepository(Exams)
    private readonly examRepo: Repository<Exams>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExamStatusUpdate(): Promise<void> {
    const now = toZonedTime(new Date(), SRI_LANKA_TZ);

    const exams = await this.examRepo.find({
      where: {
        status: Not('completed'),
      },
      relations: ['batch'],
    });

    for (const exam of exams) {
      if (!exam.startTime || !exam.endTime) {
        continue;
      }
      if (exam.status === 'completed') {
        continue;
      }

      const startTime = toZonedTime(new Date(exam.startTime), SRI_LANKA_TZ);
      const endTime = toZonedTime(new Date(exam.endTime), SRI_LANKA_TZ);
      const activeTime = addMinutes(startTime, -10);

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

        if (newStatus === 'active' && exam.notifyStudents) {
          try {
            const students = await this.studentRepo.find({
              where: { batch: { id: exam.batch.id } },
              relations: ['user'],
            });

            for (const student of students) {
              if (student.user?.email) {
                await this.emailService.sendExamWarning(student.user.email, {
                  examName: exam.examName,
                  examCode: exam.examCode,
                  batchCode: exam.batch.batchCode,
                  startTime: exam.startTime.toISOString(),
                  endTime: exam.endTime.toISOString(),
                });
              }
            }
          } catch (error) {
            console.error('Error sending exam notifications:', error);
          }
        }
      }
    }
  }
}
