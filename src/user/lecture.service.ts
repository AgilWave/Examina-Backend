import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { User } from './entities/user.entitiy';
import { Lecture } from './entities/lecture.entitiy';
import { CreateLectureDto } from './dto/lecure.dto';
import { UpdateLectureDto } from './dto/lecure.dto';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
  ) {}

  async create(
    createLectureDto: CreateLectureDto,
    currentUser?: User,
  ): Promise<ResponseContent<Lecture>> {
    try {
      const newLecture = this.lectureRepository.create(createLectureDto);

      if (currentUser) {
        newLecture.createdBy = currentUser.username;
      } else {
        newLecture.createdBy = 'System';
      }

      const savedLecture = await this.lectureRepository.save(newLecture);

      return {
        isSuccessful: true,
        message: 'Lecture record created successfully',
        content: savedLecture,
      };
    } catch (error) {
      console.error('Error creating lecture record:', error);
      return {
        isSuccessful: false,
        message: 'Error creating lecture record',
        content: null,
      };
    }
  }

  async findByUserId(userId: number): Promise<Lecture | null> {
    const lecture = await this.lectureRepository.findOne({
      where: { userId },
      relations: ['faculties', 'courses'],
    });
    return lecture;
  }

  async update(
    id: number,
    updateLectureDto: UpdateLectureDto,
    currentUser?: User,
  ): Promise<ResponseContent<Lecture>> {
    const lecture = await this.lectureRepository.findOne({
      where: { userId: id },
    });

    if (!lecture) {
      return {
        isSuccessful: false,
        message: 'Lecture record not found',
        content: null,
      };
    }

    const updatedLecture = Object.assign(lecture, updateLectureDto);

    if (currentUser) {
      updatedLecture.updatedBy = currentUser.username;
    } else {
      updatedLecture.updatedBy = 'System';
    }

    const savedLecture = await this.lectureRepository.save(updatedLecture);

    return {
      isSuccessful: true,
      message: 'Lecture record updated successfully',
      content: savedLecture,
    };
  }
}
