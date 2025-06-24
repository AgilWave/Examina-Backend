import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { EnvironmentCheckupService } from './environment-checkup.service';
import { CreateEnvironmentCheckDto } from './dto/environment.check.dto';

@Controller('environment-checkup')
export class EnvironmentCheckupController {
  constructor(
    private readonly environmentCheckupService: EnvironmentCheckupService,
  ) {}

  @Post('upload-video')
  @UseInterceptors(FileInterceptor('video'))
  uploadEnvironmentVideo(
    @UploadedFile() file: any,
    @Body() createEnvironmentCheckDto: CreateEnvironmentCheckDto,
  ) {
    if (!file) {
      throw new BadRequestException('No video file provided');
    }

    // Validate file type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('File must be a video');
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 50MB');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = this.environmentCheckupService.uploadVideo(
        file,
        createEnvironmentCheckDto,
      );

      return {
        success: true,
        message: 'Environment video uploaded successfully',
        data: result,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(`Failed to upload video: ${error.message}`);
    }
  }

  @Get('status/:examId/:studentId')
  getEnvironmentCheckStatus(
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
  ) {
    const status = this.environmentCheckupService.getCheckupStatus(
      examId,
      studentId,
    );
    return {
      success: true,
      data: status,
    };
  }

  @Get('video/:examId/:studentId')
  getEnvironmentVideo(
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ) {
    try {
      const videoStream = this.environmentCheckupService.getVideo(
        examId,
        studentId,
      );

      res.setHeader('Content-Type', 'video/webm');
      res.setHeader('Content-Disposition', 'inline');

      videoStream.pipe(res);
    } catch {
      res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }
  }
}
