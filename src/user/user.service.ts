import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entitiy';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{
    isSuccessful: boolean;
    message: string;
    content: Partial<User> | null | string;
  }> {
    try {
      const newUser = this.userRepository.create(createUserDto);

      if (newUser.password) {
        newUser.password = await this.hashPassword(newUser.password);
      }

      if (newUser.role === 'admin') {
        newUser.password = await this.hashPassword('examin@admin');
      }

      const savedUser = await this.userRepository.save(newUser);

      return {
        isSuccessful: true,
        message: 'User created successfully',
        content: {
          id: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
        },
      };
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error creating user',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async findAll(): Promise<{
    isSuccessful: boolean;
    message?: string;
    listContent: Partial<User>[];
  }> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'name', 'isBlacklisted'],
    });
    if (!users) {
      return {
        isSuccessful: false,
        message: 'No users found',
        listContent: [],
      };
    }

    return {
      isSuccessful: true,
      listContent: users,
    };
  }

  async findById(id: string): Promise<{
    isSuccessful: boolean;
    message?: string;
    content: User | null;
  }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }

    return {
      isSuccessful: true,
      content: user,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findByMicrosoftId(microsoftId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { microsoftId } });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ isSuccessful: boolean; message: string; content: any }> {
    const userResult = await this.findById(id);

    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }

    this.userRepository.merge(userResult.content, updateUserDto);
    const updatedUser = await this.userRepository.save(userResult.content);

    return {
      isSuccessful: true,
      message: 'User updated successfully',
      content: updatedUser,
    };
  }

  async remove(
    id: string,
  ): Promise<{ isSuccessful: boolean; message: string; content: any }> {
    const userResult = await this.findById(id);

    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }

    await this.userRepository.remove(userResult.content);

    return {
      isSuccessful: true,
      message: 'User removed successfully',
      content: null,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
