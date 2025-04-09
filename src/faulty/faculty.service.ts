import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entitiy';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { FacultyFilterDto } from './dto/filter.dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async findById(id: number): Promise<Faculty | null> {
    return await this.facultyRepository.findOne({ where: { id } });
  }

  async findAll(filterDto: FacultyFilterDto): Promise<ResponseList<Faculty>> {
    const { page = 1, pageSize = 10, name, isActive } = filterDto;
    const query = this.facultyRepository.createQueryBuilder('faculty');

    if (name) {
      query.andWhere('faculty.name ILIKE :name', { name: `%${name}%` });
    }

    if (isActive !== undefined) {
      query.andWhere('faculty.isActive = :isActive', { isActive });
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('faculty.createdAt', 'DESC');

    const faculties = await query.getMany();

    if (faculties.length === 0) {
      return {
        isSuccessful: false,
        message: 'No faculties found',
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
      message: 'Faculties found',
      listContent: faculties,
      paginationInfo,
    };
  }
}
