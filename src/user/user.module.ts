import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entitiy';
import { Student } from './entities/student.entitiy';
import { StudentService } from './student.service';
@Module({
  imports: [TypeOrmModule.forFeature([User, Student])],
  controllers: [UserController],
  providers: [UserService, StudentService],
  exports: [UserService, StudentService],
})
export class UserModule {}
