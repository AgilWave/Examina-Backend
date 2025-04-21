import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entitiy';
import { Course } from '../course/entities/course.entitiy'; 
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { BatchFilterDto } from './dto/filter.dto';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    @InjectRepository(Course) // Inject Course repository
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findById(id: number): Promise<Batch | null> {
    return await this.batchRepository.findOne({ where: { id } });
  }

  async findAll(filterDto: BatchFilterDto): Promise<ResponseList<Batch>> {
    const { page = 1, pageSize = 10, name, isActive, courseId } = filterDto;
    const query = this.batchRepository.createQueryBuilder('batch');

    if (name) {
      query.andWhere('batch.name ILIKE :name', { name: `%${name}%` });
    }

    if (isActive !== undefined) {
      query.andWhere('batch.isActive = :isActive', { isActive });
    }

    if (courseId) {
      query.andWhere('batch.courseId = :courseId', { courseId });
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('batch.createdAt', 'DESC');

    const batches = await query.getMany();
    
    if (batches.length > 0) {
      // Get unique course IDs from batches
      const courseIds = [...new Set(batches.map(batch => batch.courseId))];
      
      // Use courseRepository to fetch course data
      const courses = await this.courseRepository
        .createQueryBuilder('course')
        .select(['course.id', 'course.name']) // Assuming the name field is 'name'
        .where('course.id IN (:...courseIds)', { courseIds })
        .getMany();
        
      // Create a map of course ID to course name
      const courseMap = new Map(courses.map(course => [course.id, course.name]));
      
      // Add course name to each batch
      batches.forEach(batch => {
        batch.courseName = courseMap.get(batch.courseId) || '';
      });
    }

    if (batches.length === 0) {
      return {
        isSuccessful: false,
        message: 'No batches found',
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
      message: 'Batches found',
      listContent: batches,
      paginationInfo,
    };
  }
}