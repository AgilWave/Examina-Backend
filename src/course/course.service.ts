import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entitiy';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { CourseFilterDto } from './dto/filter.dto';
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findById(id: number): Promise<Course | null> {
    return await this.courseRepository.findOne({ where: { id } });
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
}
