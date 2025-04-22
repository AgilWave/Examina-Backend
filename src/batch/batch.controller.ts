import {
  Controller,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BatchService } from './batch.service';
import { BatchFilterDto } from './dto/filter.dto';
import { UpdateBatchDTO } from './dto/batch.dto';
import { User as CurrentUser } from '../user/user.decorator';
import { User } from '../user/entities/user.entitiy';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @UseGuards(JwtAuthGuard)
  @Get('Search')
  getAllBatches(@Query() filterDto: BatchFilterDto) {
    try {
      return this.batchService.findAll(filterDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Batches',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    try {
      return this.batchService.findById(id);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching Batch',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/:id')
  async updateBatch(
    @Param('id') id: number,
    @Body() updateDTO: UpdateBatchDTO,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.batchService.update(id, updateDTO, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating Batch',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
