import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModulesService } from './modules.service';
import { ModuleFilterDTO } from './dto/filter.dto';
import { UpdateModulesDTO, CreateModulesDTO } from './dto/modules.dto';
import { User as CurrentUser } from '../user/user.decorator';
import { User } from '../user/entities/user.entitiy';

@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModulesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('Search')
  getAllModules(@Query() filterDto: ModuleFilterDTO) {
    try {
      return this.moduleService.findAll(filterDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Modules',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    try {
      return this.moduleService.findById(id);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Module',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('Interact')
  async createBatch(
    @Body() createModuledTO: CreateModulesDTO,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.moduleService.create(createModuledTO, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error creating Module',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/:id')
  async updateBatch(
    @Param('id') id: number,
    @Body() updateDTO: UpdateModulesDTO,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.moduleService.update(id, updateDTO, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating Module',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/:id/Status')
  async updateBatchStatus(
    @Param('id') id: number,
    @Body() updateDTO: { status: boolean },
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.moduleService.updateStatus(id, updateDTO.status, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating Module Status',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
