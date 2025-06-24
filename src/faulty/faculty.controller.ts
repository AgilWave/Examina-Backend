import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FacultyService } from './faculty.service';
import { FacultyFilterDto } from './dto/filter.dto';
import { CreateFacultyDTO, UpdateFacultyDTO } from './dto/faculty.dto';
import { User as CurrentUser } from '../user/user.decorator';
import { User } from '../user/entities/user.entitiy';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ResponseList } from 'src/response-dtos/responseList.dto';
import { Faculty } from './entities/faculty.entitiy';

@ApiTags('Faculty')
@ApiBearerAuth()
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @ApiOperation({ summary: 'Get all faculties' })
  @UseGuards(JwtAuthGuard)
  @Get('Search')
  @ApiQuery({ type: FacultyFilterDto, name: 'filterDto' })
  @ApiOkResponse({
    description: 'List of faculties',
    type: ResponseList<Faculty>,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAllFaculties(@Query() filterDto: FacultyFilterDto) {
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

  @ApiOperation({ summary: 'Create a new faculty' })
  @ApiBody({ type: CreateFacultyDTO })
  @ApiResponse({
    status: 201,
    description: 'Faculty created successfully',
    type: Faculty,
  })
  @UseGuards(JwtAuthGuard)
  @Post('Interact')
  async createBatch(
    @Body() createFacultydTO: CreateFacultyDTO,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.facultyService.create(createFacultydTO, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error creating Faculty',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @ApiOperation({ summary: 'Update a faculty' })
  @ApiBody({ type: UpdateFacultyDTO })
  @ApiResponse({
    status: 200,
    description: 'Faculty updated successfully',
    type: Faculty,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/:id')
  async updateBatch(
    @Param('id') id: number,
    @Body() updateDTO: UpdateFacultyDTO,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.facultyService.update(id, updateDTO, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating Faculty',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @ApiOperation({ summary: 'Update a faculty status' })
  @ApiResponse({
    status: 200,
    description: 'Faculty status updated successfully',
    type: Faculty,
  })
  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/:id/Status')
  async updateBatchStatus(
    @Param('id') id: number,
    @Body() updateDTO: { isActive: boolean },
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.facultyService.updateStatus(
        id,
        updateDTO.isActive,
        currentUser,
      );
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating Faculty Status',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @ApiOperation({ summary: 'Get a faculty by ID' })
  @ApiResponse({
    status: 200,
    description: 'Faculty fetched successfully',
    type: Faculty,
  })
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
