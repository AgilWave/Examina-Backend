import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FacultyService } from './faculty.service';
import { FacultyFilterDto } from './dto/filter.dto';

@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @UseGuards(JwtAuthGuard)
  @Get('Search')
  getAllFaculties(@Query() filterDto: FacultyFilterDto) {
    try {
      return this.facultyService.findAll(filterDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Faculties',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    try {
      return this.facultyService.findById(id);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Faculty',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
