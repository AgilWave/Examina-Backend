import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entitiy';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { CourseFilterDto } from './dto/filter.dto';
import { Faculty } from '../faulty/entities/faculty.entitiy';
import { CreateCourseDTO, UpdateCourseDTO  } from './dto/course.dto';
import { User } from '../user/entities/user.entitiy';


@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async create(
    createCourseDto: CreateCourseDTO,
    currentUser?: User,
  ): Promise<ResponseContent<Course>> {
    const existingCourse = await this.courseRepository.findOne({
      where: { name: createCourseDto.name },
    });

    if (existingCourse) {
      return {
        isSuccessful: false,
        message: 'Course name already exists',
        content: null,
      };
    }

    const newCourse = this.courseRepository.create(createCourseDto);

    if (currentUser) {
      newCourse.createdBy = currentUser.username;
    } else {
      newCourse.createdBy = 'System';
    }

    const savedCourse = await this.courseRepository.save(newCourse);

    return {
      isSuccessful: true,
      message: 'Course created successfully',
      content: savedCourse,
    };
  }

  async findById(id: number): Promise<ResponseContent<Course>> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });

    if (!course) {
      return {
        isSuccessful: false,
        message: 'Course not found',
        content: null,
      };
    }

    return {
      isSuccessful: true,
      message: 'Course found',
      content: course,
    };
  }

  async findAll(filterDto: CourseFilterDto): Promise<ResponseList<Course>> {
    const { page = 1, pageSize = 10, name, isActive, facultyId } = filterDto;
    const query = this.courseRepository.createQueryBuilder('course');

    if (name) {
      query.andWhere('course.name ILIKE :name', { name: `%${name}%` });
    }

    if (isActive !== undefined) {
      query.andWhere('course.isActive = :isActive', { isActive });
    }

    if (facultyId) {
      query.andWhere('course.facultyId = :facultyId', { facultyId });
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('course.createdAt', 'DESC');

    const courses = await query.getMany();

    if (courses.length > 0) {
      const facultyIds = [
        ...new Set(courses.map((course) => course.facultyId)),
      ];

      const faculties = await this.facultyRepository
        .createQueryBuilder('faculty')
        .select(['faculty.id', 'faculty.name'])
        .where('faculty.id IN (:...facultyIds)', { facultyIds })
        .getMany();
      
      const facultyMap = new Map(
        faculties.map((faculty) => [faculty.id, faculty.name]),
      );
      courses.forEach((course) => {
        course.facultyName = facultyMap.get(course.facultyId) ?? '';
      });
    }

    if (courses.length === 0) {
      return {
        isSuccessful: false,
        message: 'No courses found',
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
      message: 'Courses found',
      listContent: courses,
      paginationInfo,
    };
  }

  async update(
    id: number,
    updateDTO: UpdateCourseDTO,
    currentUser?: User,
  ): Promise<ResponseContent<Course>> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });

    if (!course) {
      return {
        isSuccessful: false,
        message: 'Course not found',
        content: null,
      };
    }

    Object.assign(course, updateDTO);

    if (currentUser) {
      course.updatedBy = currentUser.username;
    } else {
      course.updatedBy = 'System';
    }

    const updatedCourse = await this.courseRepository.save(course);

    return {
      isSuccessful: true,
      message: 'Course updated successfully',
      content: updatedCourse,
    };
  }

  async updateStatus(
    id: number,
    isActive: boolean,
    currentUser?: User,
  ): Promise<ResponseContent<Course>> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });

    if (!course) {
      return {
        isSuccessful: false,
        message: 'Course not found',
        content: null,
      };
    }

    course.isActive = isActive;

    if (currentUser) {
      course.updatedBy = currentUser.username;
    } else {
      course.updatedBy = 'System';
    }

    const updatedCourse = await this.courseRepository.save(course);

    return {
      isSuccessful: true,
      message: `Course ${isActive ? 'activated' : 'deactivated'} successfully`,
      content: updatedCourse,
    };
  }
}
