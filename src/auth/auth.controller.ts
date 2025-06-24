/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MicrosoftTokenDto } from './dto/microsoft-token.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Validate Microsoft token' })
  @Post('microsoft')
  async validateMicrosoftToken(@Body() tokenDto: MicrosoftTokenDto) {
    try {
      const result = await this.authService.validateMicrosoftIdToken(
        tokenDto.token,
      );
      if (result && 'token' in result && 'user' in result) {
        return {
          isSuccessful: true,
          message: 'Login successful',
          content: { jwt: result.token, user: result.user },
        };
      } else if (result) {
        return {
          isSuccessful: false,
          message: result.message || 'Invalid Microsoft token',
          content: null,
        };
      } else {
        throw new UnauthorizedException('Invalid result format');
      }
    } catch (error) {
      console.error('Error validating Microsoft token:', error);
      throw new UnauthorizedException('Invalid Microsoft token');
    }
  }

  @ApiOperation({ summary: 'Logout' })
  @Post('logout')
  async logout(@Req() request) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const result = await this.authService.logout(token as string);

    if (result.success) {
      return {
        isSuccessful: true,
        message: result.message || 'Logout successful',
      };
    } else {
      return {
        isSuccessful: false,
        message: result.message || 'Logout failed',
      };
    }
  }

  @ApiOperation({ summary: 'Admin login' })
  @Post('admin-login')
  @ApiBody({ type: AdminLoginDto })
  async adminLogin(@Body() body: AdminLoginDto) {
    const { username, password } = body;

    if (!username || !password) {
      return {
        isSuccessful: false,
        message: 'Username and password are required',
        content: null,
      };
    }

    const result = await this.authService.adminUserNamePasswordLogin(
      username,
      password,
    );

    if (result.isSuccessful) {
      return {
        isSuccessful: true,
        message: result.message || 'Login successful',
        content: result.content,
      };
    } else {
      return {
        isSuccessful: false,
        message: result.message || 'Login failed',
        content: null,
      };
    }
  }
}
