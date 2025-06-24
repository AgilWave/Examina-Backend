import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { CreateEnvironmentCheckDto } from './dto/environment.check.dto';

@Injectable()
export class EnvironmentCheckupService {
  constructor() {
    // Mock constructor
    console.debug('EnvironmentCheckupService initialized (mock)');
  }

  uploadVideo(
    file: any,
    createEnvironmentCheckDto: CreateEnvironmentCheckDto,
    isMobile: boolean = false,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const fileName =
      file && typeof file === 'object' && 'originalname' in file
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          file.originalname
        : null;
    console.debug('uploadVideo called (mock)', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      file: fileName,
      createEnvironmentCheckDto,
      isMobile,
    });
    return {
      id: 'mock-id',
      examId: createEnvironmentCheckDto.examId,
      studentId: createEnvironmentCheckDto.studentId,
      videoUrl: 'https://mock.url/video.webm',
      blobName: 'mock-blob-name',
      uploadTimestamp: new Date().toISOString(),
      etag: 'mock-etag',
    };
  }

  getCheckupStatus(examId: string, studentId: string) {
    console.debug('getCheckupStatus called (mock)', { examId, studentId });
    return {
      status: 'mock-status',
      completed: true,
      uploadTimestamp: new Date().toISOString(),
      videoUrl: 'https://mock.url/video.webm',
    };
  }

  getVideo(examId: string, studentId: string): Readable {
    console.debug('getVideo called (mock)', { examId, studentId });
    // Return a mock readable stream
    const readable = new Readable();
    readable.push('mock video data');
    readable.push(null);
    return readable;
  }
}
