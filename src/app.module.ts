import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entitiy';
import { FacultyModule } from './faulty/faculty.module';
import { CourseModule } from './course/course.module';
import { BatchModule } from './batch/batch.module';
import { Student } from './user/entities/student.entitiy';
import { Faculty } from './faulty/entities/faculty.entitiy';
import { Course } from './course/entities/course.entitiy';
import { Batch } from './batch/entities/batch.entitiy';
import { Lecture } from './user/entities/lecture.entitiy';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Student, Faculty, Course, Batch, Lecture],
      synchronize: true,
      extra: {
        ssl:
          process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
    }),
    AuthModule,
    UserModule,
    FacultyModule,
    CourseModule,
    BatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
