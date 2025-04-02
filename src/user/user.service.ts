import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entitiy';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BlackListUserDto } from './dto/blacklist-user.dto';
import * as bcrypt from 'bcrypt';
import { UserFilterDto } from './dto/user-filter.dto';
import { ResponseList } from '../response-dtos/responseList.dto';
import { ResponseContent } from '../response-dtos/responseContent.dto';
import { PaginationInfo } from 'src/response-dtos/pagination-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(
    createUserDto: CreateUserDto,
    currentUser?: User,
  ): Promise<
    ResponseContent<{
      id: number;
      username: string;
      email: string;
      role: string;
    }>
  > {
    try {
      const newUser = this.userRepository.create(createUserDto);

      if (newUser.password) {
        newUser.password = await this.hashPassword(newUser.password);
      }

      if (newUser.role === 'admin') {
        newUser.password = await this.hashPassword('examin@admin');
      }

      const existingUser = await this.userRepository.findOne({
        where: [
          { email: newUser.email },
          { username: newUser.username },
          { microsoftId: newUser.microsoftId },
        ],
      });
      if (existingUser) {
        return {
          isSuccessful: false,
          message: 'User already exists',
          content: null,
        };
      }

      if (currentUser) {
        newUser.createdBy = currentUser.username;
      } else {
        newUser.createdBy = 'System';
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
      console.error('Error creating user:', error);
      return {
        isSuccessful: false,
        message: 'Error creating user',
        content: null,
      };
    }
  }

  async findAllUsers(filterDto: UserFilterDto): Promise<ResponseList<User>> {
    const { page = 1, pageSize = 10, name, isBlacklisted, role } = filterDto;

    const query = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.name', 'user.isBlacklisted']);

    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    const isBlacklistedBool =
      isBlacklisted !== undefined ? isBlacklisted : undefined;

    if (typeof isBlacklistedBool === 'boolean') {
      query.andWhere('user.isBlacklisted = :isBlacklisted', {
        isBlacklisted: isBlacklistedBool,
      });
    }


    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    const totalItems = await query.getCount();
    const totalPages = Math.ceil(totalItems / pageSize);

    query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.createdAt', 'DESC');

    const users = await query.getMany();

    if (users.length === 0) {
      return {
        isSuccessful: false,
        message: 'No users found',
        listContent: [],
      };
    }
    const paginationInfo: PaginationInfo = {
      page,
      pageSize,
      totalItems,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };

    return {
      isSuccessful: true,
      message: 'Successfully fetched users',
      listContent: users,
      paginationInfo,
    };
  }

  async findById(id: number): Promise<{
    isSuccessful: boolean;
    message?: string;
    content: User | null;
  }> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.isBlacklisted',
        'user.blacklistedReason',
        'user.role',
        'user.microsoftId',
        'user.username',
        'user.createdAt',
        'user.updatedAt',
        'user.createdBy',
        'user.updatedBy',
      ])
      .where('user.id = :id', { id });
    const user = await query.getOne();

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
    id: number,
    updateUserDto: UpdateUserDto,
    CurrentUser?: User,
  ): Promise<ResponseContent<User>> {
    const userResult = await this.findById(id);

    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }
    const updatedUser = Object.assign(userResult.content, updateUserDto);

    if (CurrentUser) {
      updatedUser.updatedBy = CurrentUser.username;
    } else {
      updatedUser.updatedBy = 'System';
    }

    const saveUser = await this.userRepository.save(updatedUser);
    if (!saveUser) {
      return {
        isSuccessful: false,
        message: 'Error updating user',
        content: null,
      };
    }
    return {
      isSuccessful: true,
      message: 'User updated successfully',
      content: null,
    };
  }

  async remove(
    id: number,
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

  async blacklistUser(
    id: number,
    { isBlacklisted, blacklistedReason }: BlackListUserDto,
    currentUser?: User,
  ): Promise<ResponseContent<User>> {
    const userResult = await this.findById(id);
    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }

    const updatedUser = Object.assign(userResult.content, {
      isBlacklisted,
      blacklistedReason,
    });

    if (currentUser) {
      updatedUser.updatedBy = currentUser.username;
    } else {
      updatedUser.updatedBy = 'System';
    }
    const saveUser = await this.userRepository.save(updatedUser);
    if (!saveUser) {
      return {
        isSuccessful: false,
        message: 'Error blacklisting user',
        content: null,
      };
    }
    return {
      isSuccessful: true,
      message: 'User blacklisted successfully',
      content: null,
    };
  }

  async resetPassword(
    id: number,
    currentUser?: User,
  ): Promise<ResponseContent<User>> {
    const userResult = await this.findById(id);
    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }
    const updatedUser = Object.assign(userResult.content, {
      password: await this.hashPassword('examin@admin'),
    });
    if (currentUser) {
      updatedUser.updatedBy = currentUser.username;
    }
    const saveUser = await this.userRepository.save(updatedUser);
    if (!saveUser) {
      return {
        isSuccessful: false,
        message: 'Error resetting password',
        content: null,
      };
    }
    return {
      isSuccessful: true,
      message: 'Password reset successfully',
      content: null,
    };
  }

  async updatePassword(
    id: number,
    { password }: UpdateUserDto,
    currentUser?: User,
  ): Promise<ResponseContent<User>> {
    const userResult = await this.findById(id);
    if (!userResult.isSuccessful || !userResult.content) {
      return {
        isSuccessful: false,
        message: 'User not found',
        content: null,
      };
    }
    if (!password) {
      return {
        isSuccessful: false,
        message: 'Password is required',
        content: null,
      };
    }

    const updatedUser = Object.assign(userResult.content, {
      password: await this.hashPassword(password),
    });
    if (currentUser) {
      updatedUser.updatedBy = currentUser.username;
    }
    const saveUser = await this.userRepository.save(updatedUser);
    if (!saveUser) {
      return {
        isSuccessful: false,
        message: 'Error updating password',
        content: null,
      };
    }
    return {
      isSuccessful: true,
      message: 'Password updated successfully',
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
