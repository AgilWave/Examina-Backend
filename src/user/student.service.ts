import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entitiy';
import { CreateStudentDto } from './dto/student.dto';
import { UpdateStudentDto } from './dto/student.dto';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { User } from './entities/user.entitiy';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
    currentUser?: User,
  ): Promise<ResponseContent<Student>> {
    try {
      const newStudent = this.studentRepository.create(createStudentDto);

      if (currentUser) {
        newStudent.createdBy = currentUser.username;
      } else {
        newStudent.createdBy = 'System';
      }

      const savedStudent = await this.studentRepository.save(newStudent);

      return {
        isSuccessful: true,
        message: 'Student record created successfully',
        content: savedStudent,
      };
    } catch (error) {
      console.error('Error creating student record:', error);
      return {
        isSuccessful: false,
        message: 'Error creating student record',
        content: null,
      };
    }
  }

  async findByUserId(userId: number): Promise<Student | null> {
    const student = await this.studentRepository.findOne({
      where: { userId },
      relations: ['faculty', 'batch', 'course'],
    });
    return student;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
    currentUser?: User,
  ): Promise<ResponseContent<Student>> {
    const student = await this.studentRepository.findOne({
      where: { userId: id },
    });

    if (!student) {
      return {
        isSuccessful: false,
        message: 'Student record not found',
        content: null,
      };
    }

    const updatedStudent = Object.assign(student, updateStudentDto);

    if (currentUser) {
      updatedStudent.updatedBy = currentUser.username;
    } else {
      updatedStudent.updatedBy = 'System';
    }

    const savedStudent = await this.studentRepository.save(updatedStudent);

    return {
      isSuccessful: true,
      message: 'Student record updated successfully',
      content: savedStudent,
    };
  }
}
