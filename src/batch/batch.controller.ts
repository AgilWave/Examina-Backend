import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BatchService } from './batch.service';
import { BatchFilterDto } from './dto/filter.dto';

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
}
