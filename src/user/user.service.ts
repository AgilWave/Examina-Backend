/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entitiy';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BlackListUserDto } from './dto/blacklist-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserFilterDto } from './dto/user-filter.dto';
import { ResponseList } from '../response-dtos/responseList.dto';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { PaginationInfo } from '../response-dtos/pagination-response.dto';
import { UpdateLectureDto } from './dto/lecure.dto';
import { StudentService } from './student.service';
import { UpdateStudentDto } from './dto/student.dto';
import { LectureService } from './lecture.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly studentService: StudentService,
    private readonly lectureService: LectureService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    currentUser?: User,
  ): Promise<
    ResponseContent<{
      id: number;
      username: string;
      email: string;
      role: string;
    }>
  > {
    try {
      const newUser = this.userRepository.create(createUserDto);

      if (newUser.password) {
        newUser.password = await this.hashPassword(newUser.password);
      }

      if (newUser.role === 'admin') {
        newUser.password = await this.hashPassword('examin@admin');
      }

      const existingUser = await this.userRepository.findOne({
        where: [
          { email: newUser.email },
          { username: newUser.username },
          { microsoftId: newUser.microsoftId },
        ],
      });
      if (existingUser) {
        return {
          isSuccessful: false,
          message: 'User already exists',
          content: null,
        };
      }

      if (currentUser) {
        newUser.createdBy = currentUser.username;
      } else {
        newUser.createdBy = 'System';
      }

      const savedUser = await this.userRepository.save(newUser);

      if (savedUser.role === 'student') {
        await this.studentService.create({
          userId: savedUser.id,
        });
      } else if (savedUser.role === 'lecturer') {
        await this.lectureService.create({
          userId: savedUser.id,
        });
      }

      return {
        isSuccessful: true,
        message: 'User created successfully',
        content: {
          id: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
        },
      };
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      return {
        isSuccessful: false,
        message: 'Error creating user',
        content: null,
      };
    }
  }

  async findAllUsers(filterDto: UserFilterDto): Promise<ResponseList<User>> {
    const { page = 1, pageSize = 10, name, isBlacklisted, role } = filterDto;

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.lecture', 'lecture')
      .leftJoinAndSelect('lecture.faculties', 'faculties')
      .leftJoinAndSelect('lecture.courses', 'courses')
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.isBlacklisted',
        'user.role',
        'user.createdAt',
        'lecture',
        'faculties',
        'courses',
      ]);

    if (role === 'student') {
      query
        .leftJoin('user.student', 'student')
        .leftJoin('student.batch', 'batch')
        .addSelect(['student.id', 'batch.batchCode']);
    }

    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    const isBlacklistedBool =
      isBlacklisted !== undefined ? isBlacklisted : undefined;

    if (typeof isBlacklistedBool === 'boolean') {
      query.andWhere('user.isBlacklisted = :isBlacklisted', {
        isBlacklisted: isBlacklistedBool,
      });
    }

    if (role) {
      if (role === 'admin') {
        query.andWhere('user.role IN (:...roles)', {
          roles: ['superAdmin', 'admin'],
        });
      } else {
        query.andWhere('user.role = :role', { role });
      }
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.createdAt', 'DESC');

    const users = await query.getMany();

    if (users.length === 0) {
      return {
        isSuccessful: false,
        message: 'No users found',
        listContent: [],
      };
    }

    const paginationInfo: PaginationInfo = {
      page,
      pageSize,
      totalItems,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };

    return {
      isSuccessful: true,
      message: 'Successfully fetched users',
      listContent: users,
      paginationInfo,
    };
  }

  async findById(id: number): Promise<{
    isSuccessful: boolean;
    message?: string;
    content: User | null;
  }> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.role',
        'user.username',
        'user.isBlacklisted',
        'user.blacklistedReason',
        'user.createdAt',
        'user.updatedAt',
        'user.createdBy',
        'user.updatedBy',
      ])
      .where('user.id = :id', { id });

    const user = await query.getOne();

    if (!user) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }

    if (user.role === 'student') {
      const studentUser = await this.userRepository.findOne({
        where: { id },
        relations: {
          student: {
            faculty: true,
            course: true,
            batch: true,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          isBlacklisted: true,
          blacklistedReason: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
          student: {
            id: true,
            faculty: {
              id: true,
              name: true,
            },
            course: {
              id: true,
              name: true,
            },
            batch: {
              id: true,
              batchCode: true,
            },
          },
        },
      });

      return {
        isSuccessful: true,
        content: studentUser,
      };
    } else if (user.role === 'lecturer') {
      const lectureUser = await this.userRepository.findOne({
        where: { id },
        relations: {
          lecture: {
            faculties: true,
            courses: true,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          isBlacklisted: true,
          blacklistedReason: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
          lecture: {
            id: true,
            faculties: true,
            courses: true,
          },
        },
      });

      return {
        isSuccessful: true,
        content: lectureUser,
      };
    }
    return {
      isSuccessful: true,
      content: user,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findByMicrosoftId(microsoftId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { microsoftId } });
  }

  async update(
    id: number,
    uddateDTO: UpdateUserDto | UpdateStudentDto | UpdateLectureDto,
    CurrentUser?: User,
  ): Promise<ResponseContent<User>> {
    const userResult = await this.findById(id);

    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }

    if ('facultyIds' in uddateDTO || 'courseIds' in uddateDTO) {
      const lecture = await this.lectureService.findByUserId(id);
      if (!lecture) {
        return {
          isSuccessful: false,
          message: 'Lecture not found',
          content: null,
        };
      }
      const saveLecture = await this.lectureService.update(
        id,
        uddateDTO,
        CurrentUser,
      );
      if (!saveLecture.isSuccessful) {
        return {
          isSuccessful: false,
          message: 'Error updating lecture',
          content: null,
        };
      }
      return {
        isSuccessful: true,
        message: 'Lecture updated successfully',
        content: null,
      };
    } else if (
      'facultyId' in uddateDTO ||
      'batchId' in uddateDTO ||
      'courseId' in uddateDTO
    ) {
      const student = await this.studentService.findByUserId(id);
      if (!student) {
        return {
          isSuccessful: false,
          message: 'Student not found',
          content: null,
        };
      }
      const saveStudent = await this.studentService.update(
        id,
        uddateDTO,
        CurrentUser,
      );
      if (!saveStudent.isSuccessful) {
        return {
          isSuccessful: false,
          message: 'Error updating student',
          content: null,
        };
      }
      return {
        isSuccessful: true,
        message: 'Student updated successfully',
        content: null,
      };
    } else {
      const updatedUser = Object.assign(userResult.content, uddateDTO);

      if (CurrentUser) {
        updatedUser.updatedBy = CurrentUser.username;
      } else {
        updatedUser.updatedBy = 'System';
      }

      const saveUser = await this.userRepository.save(updatedUser);
      if (!saveUser) {
        return {
          isSuccessful: false,
          message: 'Error updating user',
          content: null,
        };
      }
      return {
        isSuccessful: true,
        message: 'User updated successfully',
        content: null,
      };
    }
  }

  async remove(
    id: number,
  ): Promise<{ isSuccessful: boolean; message: string; content: any }> {
    const userResult = await this.findById(id);

    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }

    await this.userRepository.remove(userResult.content);

    return {
      isSuccessful: true,
      message: 'User removed successfully',
      content: null,
    };
  }

  async blacklistUser(
    id: number,
    { isBlacklisted, blacklistedReason }: BlackListUserDto,
    currentUser?: User,
  ): Promise<ResponseContent<User>> {
    const userResult = await this.findById(id);
    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }

    const updatedUser = Object.assign(userResult.content, {
      isBlacklisted,
      blacklistedReason,
    });

    if (currentUser) {
      updatedUser.updatedBy = currentUser.username;
    } else {
      updatedUser.updatedBy = 'System';
    }
    const saveUser = await this.userRepository.save(updatedUser);
    if (!saveUser) {
      return {
        isSuccessful: false,
        message: 'Error blacklisting user',
        content: null,
      };
    }
    return {
      isSuccessful: true,
      message: 'User blacklisted successfully',
      content: null,
    };
  }

  async resetPassword(
    id: number,
    currentUser?: User,
  ): Promise<ResponseContent<User>> {
    const userResult = await this.findById(id);
    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }
    const updatedUser = Object.assign(userResult.content, {
      password: await this.hashPassword('examin@admin'),
    });
    if (currentUser) {
      updatedUser.updatedBy = currentUser.username;
    }
    const saveUser = await this.userRepository.save(updatedUser);
    if (!saveUser) {
      return {
        isSuccessful: false,
        message: 'Error resetting password',
        content: null,
      };
    }
    return {
      isSuccessful: true,
      message: 'Password reset successfully',
      content: null,
    };
  }

  async updatePassword(
    id: number,
    { password }: UpdateUserDto,
    currentUser?: User,
  ): Promise<ResponseContent<User>> {
    const userResult = await this.findById(id);
    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }
    if (!password) {
      return {
        isSuccessful: false,
        message: 'Password is required',
        content: null,
      };
    }

    const updatedUser = Object.assign(userResult.content, {
      password: await this.hashPassword(password),
    });
    if (currentUser) {
      updatedUser.updatedBy = currentUser.username;
    }
    const saveUser = await this.userRepository.save(updatedUser);
    if (!saveUser) {
      return {
        isSuccessful: false,
        message: 'Error updating password',
        content: null,
      };
    }
    return {
      isSuccessful: true,
      message: 'Password updated successfully',
      content: null,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
