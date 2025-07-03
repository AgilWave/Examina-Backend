import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Raw } from 'typeorm';
import { Exams } from '../exams/entities/exams.entitiy';
import { Student } from '../user/entities/student.entitiy';
import { Lecture } from '../user/entities/lecture.entitiy';
import { ExamParticipant } from '../exams/entities/exam-participants.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
    @InjectRepository(ExamParticipant)
    private readonly examParticipantRepository: Repository<ExamParticipant>,
  ) {}

  async getOverview() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Exams
    const totalExams = await this.examsRepository.count();
    const examsLast24h = await this.examsRepository.count({
      where: { createdAt: MoreThan(last24h) },
    });

    // Students
    const totalStudents = await this.studentRepository.count();
    const studentsLast24h = await this.studentRepository.count({
      where: { createdAt: MoreThan(last24h) },
    });

    // Lecturers
    const totalLecturers = await this.lectureRepository.count();
    const lecturersLast24h = await this.lectureRepository.count({
      where: { createdAt: MoreThan(last24h) },
    });

    // Total Hours (sum of all exam durations in hours)
    const allExams = await this.examsRepository.find();
    const totalHours = allExams.reduce((sum, exam) => {
      const start = new Date(exam.startTime).getTime();
      const end = new Date(exam.endTime).getTime();
      return sum + (end - start) / (1000 * 60 * 60);
    }, 0);
    const last24hExams = allExams.filter(
      (e) => new Date(e.createdAt) > last24h,
    );
    const last24hHours = last24hExams.reduce((sum, exam) => {
      const start = new Date(exam.startTime).getTime();
      const end = new Date(exam.endTime).getTime();
      return sum + (end - start) / (1000 * 60 * 60);
    }, 0);

    // Examination Summary (monthly exam counts for last 6 months)
    const months: Date[] = [];
    const monthLabels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
      monthLabels.push(d.toLocaleString('default', { month: 'short' }));
    }
    const examCounts = await Promise.all(
      months.map(async (monthDate, idx) => {
        const start = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          1,
        );
        const end = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          1,
        );
        const count = await this.examsRepository.count({
          where: {
            createdAt: Raw(
              (alias) => `${alias} >= :start AND ${alias} < :end`,
              { start, end },
            ),
          },
        });
        return { month: monthLabels[idx], count };
      }),
    );

    // Student Participation (by batch, top 6)
    const batchParticipation = await this.examParticipantRepository
      .createQueryBuilder('participant')
      .leftJoin('participant.student', 'student')
      .leftJoin('student.batch', 'batch')
      .select('batch.batchCode', 'label')
      .addSelect('COUNT(DISTINCT participant.student)', 'count')
      .groupBy('batch.batchCode')
      .orderBy('count', 'DESC')
      .limit(6)
      .getRawMany();

    // Recent Access (last 5 exam participants)
    const recentParticipants = await this.examParticipantRepository.find({
      order: { joinedAt: 'DESC' },
      take: 5,
      relations: ['student', 'student.user'],
    });
    const recentAccess = recentParticipants.map((p) => ({
      studentName: p.student.user?.name,
      studentId: p.student.studentId,
      time: p.joinedAt,
      avatar:
        p.student.user && 'avatar' in p.student.user
          ? p.student.user.avatar
          : null,
    }));

    // Upcoming Activities (next 3 upcoming exams)
    const upcomingExams = await this.examsRepository.find({
      where: { examDate: MoreThan(now) },
      order: { examDate: 'ASC' },
      take: 3,
    });
    const upcomingActivities = upcomingExams.map((exam) => ({
      title: exam.examName,
      type: exam.examMode,
      date: exam.examDate.toISOString().split('T')[0],
      status: exam.status.charAt(0).toUpperCase() + exam.status.slice(1),
    }));

    return {
      totalExams: { count: totalExams, last24h: examsLast24h },
      totalStudents: { count: totalStudents, last24h: studentsLast24h },
      totalLecturers: { count: totalLecturers, last24h: lecturersLast24h },
      totalHours: {
        count: Math.round(totalHours),
        last24h: Math.round(last24hHours),
      },
      examinationSummary: examCounts,
      studentParticipation: batchParticipation,
      recentAccess,
      upcomingActivities,
    };
  }
}
