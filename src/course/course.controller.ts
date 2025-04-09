import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CourseService } from './course.service';
import { CourseFilterDto } from './dto/filter.dto';

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
}
