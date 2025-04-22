import { Controller, Get, Param, Body, UseGuards, Query, Post, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CourseService } from './course.service';
import { CourseFilterDto } from './dto/filter.dto';
import { CreateCourseDTO, UpdateCourseDTO } from './dto/course.dto';
import { User as CurrentUser } from '../user/user.decorator';
import { User } from '../user/entities/user.entitiy';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  

  @UseGuards(JwtAuthGuard)
  @Get('Search')
  getAllCourses(@Query() filterDto: CourseFilterDto) {
    try {
      return this.courseService.findAll(filterDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Courses',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    try {
      return this.courseService.findById(id);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Course',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('Interact')
  async createCourse(
    @Body() createCourseDto: CreateCourseDTO,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.courseService.create(createCourseDto, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error creating Course',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }


    @UseGuards(JwtAuthGuard)
    @Patch('Interact/Update/:id')
    async updateCourse(
      @Param('id') id: number,
      @Body() updateDTO: UpdateCourseDTO,
      @CurrentUser() currentUser: User,
    ) {
      try {
        return this.courseService.update(id, updateDTO, currentUser);
      } catch (error: unknown) {
        return {
          isSuccessful: false,
          message: 'Error updating Course',
          content: error instanceof Error ? error.message : String(error),
        };
      }
    }

  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/:id/Status')
  async updateCourseStatus(
    @Param('id') id: number,
    @Body() updateDTO: { status: boolean },
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.courseService.updateStatus(id, updateDTO.status, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating Course status',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
