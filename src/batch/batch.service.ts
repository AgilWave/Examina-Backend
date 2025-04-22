import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entitiy';
import { Course } from '../course/entities/course.entitiy';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { BatchFilterDto } from './dto/filter.dto';
import { UpdateBatchDTO, CreateBatchDTO } from './dto/batch.dto';
import { User } from '../user/entities/user.entitiy';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(
    createBatchDto: CreateBatchDTO,
    currentUser?: User,
  ): Promise<ResponseContent<Batch>> {
    const existingBatch = await this.batchRepository.findOne({
      where: { batchCode: createBatchDto.batchCode },
    });

    if (existingBatch) {
      return {
        isSuccessful: false,
        message: 'Batch code already exists',
        content: null,
      };
    }

    const newBatch = this.batchRepository.create(createBatchDto);

    if (currentUser) {
      newBatch.createdBy = currentUser.username;
    } else {
      newBatch.createdBy = 'System';
    }

    const savedBatch = await this.batchRepository.save(newBatch);

    return {
      isSuccessful: true,
      message: 'Batch created successfully',
      content: savedBatch,
    };
  }

  async findById(id: number): Promise<ResponseContent<Batch>> {
    const batch = await this.batchRepository.findOne({
      where: { id },
    });

    if (!batch) {
      return {
        isSuccessful: false,
        message: 'Batch not found',
        content: null,
      };
    }

    return {
      isSuccessful: true,
      message: 'Batch found',
      content: batch,
    };
  }

  async findAll(filterDto: BatchFilterDto): Promise<ResponseList<Batch>> {
    const { page = 1, pageSize = 10, name, isActive, courseId } = filterDto;
    const query = this.batchRepository.createQueryBuilder('batch');

    if (name) {
      query.andWhere('batch.batchCode ILIKE :name', { name: `%${name}%` });
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
      const courseIds = [...new Set(batches.map((batch) => batch.courseId))];

      const courses = await this.courseRepository
        .createQueryBuilder('course')
        .select(['course.id', 'course.name'])
        .where('course.id IN (:...courseIds)', { courseIds })
        .getMany();

      const courseMap = new Map(
        courses.map((course) => [course.id, course.name]),
      );

      batches.forEach((batch) => {
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

  async update(
    id: number,
    updateBatchDto: UpdateBatchDTO,
    currentUser?: User,
  ): Promise<ResponseContent<Batch>> {
    const batch = await this.batchRepository.findOne({
      where: { id },
    });

    if (!batch) {
      return {
        isSuccessful: false,
        message: 'Batch not found',
        content: null,
      };
    }

    const updatedBatch = Object.assign(batch, updateBatchDto);

    if (currentUser) {
      updatedBatch.updatedBy = currentUser.username;
    } else {
      updatedBatch.updatedBy = 'System';
    }

    const savedBatch = await this.batchRepository.save(updatedBatch);

    return {
      isSuccessful: true,
      message: 'Batch updated successfully',
      content: savedBatch,
    };
  }

  async updateStatus(
    id: number,
    isActive: boolean,
    currentUser?: User,
  ): Promise<ResponseContent<Batch>> {
    const batch = await this.batchRepository.findOne({
      where: { id },
    });

    if (!batch) {
      return {
        isSuccessful: false,
        message: 'Batch not found',
        content: null,
      };
    }

    batch.isActive = isActive;

    if (currentUser) {
      batch.updatedBy = currentUser.username;
    } else {
      batch.updatedBy = 'System';
    }

    const updatedBatch = await this.batchRepository.save(batch);

    return {
      isSuccessful: true,
      message: `Batch ${isActive ? 'activated' : 'deactivated'} successfully`,
      content: updatedBatch,
    };
  }
}
