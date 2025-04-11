import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entitiy';
import { Student } from './entities/student.entitiy';
import { StudentService } from './student.service';
import { Lecture } from './entities/lecture.entitiy';
import { LectureService } from './lecture.service';
@Module({
  imports: [TypeOrmModule.forFeature([User, Student, Lecture])],
  controllers: [UserController],
  providers: [UserService, StudentService, LectureService],
  exports: [UserService, StudentService, LectureService],
})
export class UserModule {}
