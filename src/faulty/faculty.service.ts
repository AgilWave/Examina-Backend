import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entitiy';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { FacultyFilterDto } from './dto/filter.dto';
import { CreateFacultyDTO, UpdateFacultyDTO } from './dto/faculty.dto';
import { User as CurrentUser } from '../user/user.decorator';
import { User } from '../user/entities/user.entitiy';
import { ResponseContent } from 'src/response-dtos/responseContent.dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async create(
    createFacultyDTO: CreateFacultyDTO,
    currentUser?: User,
  ): Promise<ResponseContent<Faculty>> {
    const existingFaculty = await this.facultyRepository.findOne({
      where: { name: createFacultyDTO.name },
    });

    console.log('Existing faculty:', existingFaculty);
    if (existingFaculty) {
      return {
        isSuccessful: false,
        message: 'Faculty already exists',
        content: null,
      };
    }

    const newFaculty = this.facultyRepository.create(createFacultyDTO);

    if (currentUser) {
      newFaculty.createdBy = currentUser.username;
    } else {
      newFaculty.createdBy = 'System';
    }

    const savedFaculty = await this.facultyRepository.save(newFaculty);

    return {
      isSuccessful: true,
      message: 'Faculty created successfully',
      content: savedFaculty,
    };
  }

  async findById(id: number): Promise<ResponseContent<Faculty>> {
      const faculty = await this.facultyRepository.findOne({
        where: { id },
      });
  
      if (!faculty) {
        return {
          isSuccessful: false,
          message: 'Faculty not found',
          content: null,
        };
      }
  
      return {
        isSuccessful: true,
        message: 'Faculty found',
        content: faculty,
      };
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

  async update(
      id: number,
      updateFacultyDto: UpdateFacultyDTO,
      currentUser?: User,
    ): Promise<ResponseContent<Faculty>> {
      const faculty = await this.facultyRepository.findOne({
        where: { id },
      });
  
      if (!faculty) {
        return {
          isSuccessful: false,
          message: 'Faculty not found',
          content: null,
        };
      }
  
      const updatedFaculty = Object.assign(faculty, updateFacultyDto);
  
      if (currentUser) {
        updatedFaculty.updatedBy = currentUser.username;
      } else {
        updatedFaculty.updatedBy = 'System';
      }
  
      const savedFaculty = await this.facultyRepository.save(updatedFaculty);
  
      return {
        isSuccessful: true,
        message: 'Faculty updated successfully',
        content: savedFaculty,
      };
    }


     async updateStatus(
        id: number,
        isActive: boolean,
        currentUser?: User,
      ): Promise<ResponseContent<Faculty>> {
        const faculty = await this.facultyRepository.findOne({
          where: { id },
        });
    
        if (!faculty) {
          return {
            isSuccessful: false,
            message: 'Faculty not found',
            content: null,
          };
        }
    
        faculty.isActive = isActive;
    
        if (currentUser) {
          faculty.updatedBy = currentUser.username;
        } else {
          faculty.updatedBy = 'System';
        }
    
        const updatedfaculty = await this.facultyRepository.save(faculty);
    
        return {
          isSuccessful: true,
          message: `Faculty ${isActive ? 'activated' : 'deactivated'} successfully`,
          content: updatedfaculty,
        };
      }
  
}
