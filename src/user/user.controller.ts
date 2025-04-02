import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BlackListUserDto } from './dto/blacklist-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User as CurrentUser } from './user.decorator';
import { User } from './entities/user.entitiy';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('Interact')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.userService.create(createUserDto, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('Search')
  getAllUsers(@Query() filterDto: UserFilterDto) {
    try {
      return this.userService.findAllUsers(filterDto);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching users',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    try {
      return this.userService.findById(id);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error fetching user',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/:id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      if (currentUser.id === id) {
        return {
          isSuccessful: false,
          message: 'You cannot update your own account',
          content: null,
        };
      }
      return this.userService.update(id, updateUserDto, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating user',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('Interact/:id')
  remove(@Param('id') id: number) {
    try {
      return this.userService.remove(id);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error deleting user',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/Blacklist/:id')
  async blacklistUser(
    @Param('id') id: number,
    @Body() updateUserDto: BlackListUserDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      if (currentUser.id === id) {
        return {
          isSuccessful: false,
          message: 'You cannot blacklist your own account',
          content: null,
        };
      }
      return this.userService.blacklistUser(id, updateUserDto, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error blacklisting user',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('Interact/ResetPassword/:id')
  async resetPassword(
    @Param('id') id: number,
    @CurrentUser() currentUser: User,
  ) {
    try {
      if (currentUser.id === id) {
        return {
          isSuccessful: false,
          message: 'You cannot reset your own password',
          content: null,
        };
      }
      return this.userService.resetPassword(id, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error resetting password',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // update password
  @UseGuards(JwtAuthGuard)
  @Patch('Interact/UpdatePassword/:id')
  async updatePassword(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    try {
      return this.userService.updatePassword(id, updateUserDto, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating password',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
