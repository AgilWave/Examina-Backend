import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ViolationsService } from './violations.service';
import { CreateViolationDTO } from './dto/create-violation.dto';
import { ViolationFilterDto } from './dto/filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/user.decorator';
import { User as UserEntity } from '../user/entities/user.entitiy';

@Controller('violations')
@UseGuards(JwtAuthGuard)
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Post()
  async create(@Body() createViolationDTO: CreateViolationDTO) {
    return await this.violationsService.create(createViolationDTO);
  }

  @Get()
  async findAll(@Query() filterDto: ViolationFilterDto) {
    return await this.violationsService.findAll(filterDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.violationsService.findById(parseInt(id));
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; adminNotes?: string },
    @User() user: UserEntity,
  ) {
    return await this.violationsService.updateStatus(
      parseInt(id),
      body.status,
      user.username,
      body.adminNotes,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.violationsService.delete(parseInt(id));
  }

  @Get('exam/:examId')
  async getViolationsByExam(@Param('examId') examId: string) {
    return await this.violationsService.getViolationsByExam(examId);
  }

  @Get('student/:studentId')
  async getViolationsByStudent(@Param('studentId') studentId: string) {
    return await this.violationsService.getViolationsByStudent(studentId);
  }
}
