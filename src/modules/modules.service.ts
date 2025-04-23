import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modules } from './entities/modules.entitiy';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';
import { ModuleFilterDTO } from './dto/filter.dto';
import { UpdateModulesDTO, CreateModulesDTO } from './dto/modules.dto';
import { User } from '../user/entities/user.entitiy';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) {}

  async create(
    createModuleDTO: CreateModulesDTO,
    currentUser?: User,
  ): Promise<ResponseContent<Modules>> {
    const existingModule = await this.moduleRepository.findOne({
      where: { name: createModuleDTO.name },
    });
    if (existingModule) {
      return {
        isSuccessful: false,
        message: 'Module already exists',
        content: null,
      };
    }

    const newModule = this.moduleRepository.create(createModuleDTO);

    if (currentUser) {
      newModule.createdBy = currentUser.username;
    } else {
      newModule.createdBy = 'System';
    }

    const savedModule = await this.moduleRepository.save(newModule);

    return {
      isSuccessful: true,
      message: 'Module created successfully',
      content: savedModule,
    };
  }

  async findById(id: number): Promise<ResponseContent<Modules>> {
    const module = await this.moduleRepository.findOne({
      where: { id },
    });

    if (!module) {
      return {
        isSuccessful: false,
        message: 'Module not found',
        content: null,
      };
    }

    return {
      isSuccessful: true,
      message: 'Module found',
      content: module,
    };
  }

  async findAll(filterDto: ModuleFilterDTO): Promise<ResponseList<Modules>> {
    const { page = 1, pageSize = 10, name, isActive } = filterDto;
    const query = this.moduleRepository.createQueryBuilder('module');

    if (name) {
      query.andWhere('module.name ILIKE :name', { name: `%${name}%` });
    }

    if (isActive !== undefined) {
      query.andWhere('module.isActive = :isActive', { isActive });
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('module.createdAt', 'DESC');

    const modules = await query.getMany();

    if (modules.length === 0) {
      return {
        isSuccessful: false,
        message: 'No Modules found',
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
      message: 'Modules found',
      listContent: modules,
      paginationInfo,
    };
  }

  async update(
    id: number,
    updateModuleDto: UpdateModulesDTO,
    currentUser?: User,
  ): Promise<ResponseContent<Modules>> {
    const module = await this.moduleRepository.findOne({
      where: { id },
    });

    if (!module) {
      return {
        isSuccessful: false,
        message: 'Module not found',
        content: null,
      };
    }

    const updatedModule = Object.assign(module, updateModuleDto);

    if (currentUser) {
      updatedModule.updatedBy = currentUser.username;
    } else {
      updatedModule.updatedBy = 'System';
    }

    const savedModule = await this.moduleRepository.save(updatedModule);

    return {
      isSuccessful: true,
      message: 'Module updated successfully',
      content: savedModule,
    };
  }

  async updateStatus(
    id: number,
    isActive: boolean,
    currentUser?: User,
  ): Promise<ResponseContent<Modules>> {
    const module = await this.moduleRepository.findOne({
      where: { id },
    });

    if (!module) {
      return {
        isSuccessful: false,
        message: 'Module not found',
        content: null,
      };
    }

    module.isActive = isActive;

    if (currentUser) {
      module.updatedBy = currentUser.username;
    } else {
      module.updatedBy = 'System';
    }

    const updatedBatch = await this.moduleRepository.save(module);

    return {
      isSuccessful: true,
      message: `Module ${isActive ? 'activated' : 'deactivated'} successfully`,
      content: updatedBatch,
    };
  }
}
