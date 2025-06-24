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
import { ResponseList } from '../response-dtos/responseList.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ResponseContent } from 'src/response-dtos/responseContent.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @UseGuards(JwtAuthGuard)
  @Post('Interact')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.userService.create(createUserDto, currentUser);
  }

  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(JwtAuthGuard)
  @Get('Search')
  @ApiQuery({ type: UserFilterDto, name: 'filterDto' })
  @ApiOkResponse({
    description: 'List of users',
    type: ResponseList<User>,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
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

  @ApiOperation({ summary: 'Get a user by id' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiOkResponse({
    description: 'User found',
    type: ResponseContent<User>,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
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

  @ApiOperation({ summary: 'Update a user' })
  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/:id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  update(
    @Param('id') id: number,
    @Body() updateDTO: UpdateUserDto,
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
      return this.userService.update(id, updateDTO, currentUser);
    } catch (error: unknown) {
      return {
        isSuccessful: false,
        message: 'Error updating user',
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @ApiOperation({ summary: 'Delete a user' })
  @UseGuards(JwtAuthGuard)
  @Delete('Interact/:id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
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

  @ApiOperation({ summary: 'Blacklist a user' })
  @UseGuards(JwtAuthGuard)
  @Patch('Interact/Update/Blacklist/:id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({ type: BlackListUserDto })
  @ApiResponse({
    status: 200,
    description: 'User blacklisted successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
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

  @ApiOperation({ summary: 'Reset a user password' })
  @UseGuards(JwtAuthGuard)
  @Patch('Interact/ResetPassword/:id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
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
  @ApiOperation({ summary: 'Update a user password' })
  @UseGuards(JwtAuthGuard)
  @Patch('Interact/UpdatePassword/:id')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
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
