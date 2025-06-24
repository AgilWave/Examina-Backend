/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  OnModuleDestroy,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { StudentService } from 'src/user/student.service';

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private jwksClient;
  private readonly BLACKLIST_PREFIX = 'token:blacklist:';
  private blacklist: Set<string> = new Set();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly studentService: StudentService,
  ) {
    this.jwksClient = jwksClient({
      jwksUri: `https://login.microsoftonline.com/common/discovery/v2.0/keys`,
      cache: true,
      rateLimit: true,
    });
  }

  async onModuleInit() {}

  async onModuleDestroy() {}

  /**
   * Blacklist a token permanently (in-memory)
   * @param token The JWT token to blacklist
   */
  blacklistToken(token: string): boolean {
    try {
      this.blacklist.add(token);
      return true;
    } catch (error) {
      console.error('Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if a token is blacklisted (in-memory)
   * @param token The JWT token to check
   * @returns Boolean indicating if token is blacklisted
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  /**
   * Handle user logout by blacklisting their token
   * @param token The JWT token to invalidate
   * @returns Success status
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      const blacklisted = this.blacklistToken(cleanToken);

      if (blacklisted) {
        return { success: true, message: 'Successfully logged out' };
      } else {
        return { success: false, message: 'Failed to blacklist token' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Invalid token' };
    }
  }

  async validateMicrosoftIdToken(idToken: string) {
    try {
      if (this.isTokenBlacklisted(idToken)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const decoded = jwt.decode(idToken, { complete: true });
      if (!decoded || typeof decoded !== 'object' || !decoded.header.kid) {
        throw new UnauthorizedException('Invalid token format');
      }

      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      const verifiedToken: any = jwt.verify(idToken, signingKey as jwt.Secret, {
        audience: process.env.AZURE_AD_CLIENT_ID,
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      });
      const email = verifiedToken.email || verifiedToken.preferred_username;

      if (!email) {
        throw new UnauthorizedException('Email not found in token');
      }

      const emailStr = String(email);

      let user = await this.userService.findByEmail(emailStr);

      if (!user) {
        const createResponse = await this.userService.create({
          email: emailStr,
          name: verifiedToken.name,
          microsoftId: verifiedToken.sub,
        });
        if (!createResponse.isSuccessful || !createResponse.content) {
          throw new UnauthorizedException('Failed to create user');
        }

        user = createResponse.content as any;
      }

      if (user?.isBlacklisted) {
        return {
          isSuccessful: false,
          message: 'This Account is blacklisted, Please contact admin',
          content: null,
        };
      }

      let studentDetails: any = null;

      if (user?.role === 'student') {
        const student = await this.studentService.findByUserId(user.id);
        if (student) {
          studentDetails = {
            studentId: student.studentId,
            batchId: student.batchId,
            courseId: student.courseId,
          };
        }
      }

      const payload = {
        sub: user?.id,
        email: user?.email,
        name: user?.name,
      };

      return {
        isSuccessful: true,
        message: 'Login successful',
        token: this.jwtService.sign(payload),
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.name,
          ...(studentDetails && { studentDetails }),
        },
      };
    } catch (error) {
      console.error('Token validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async adminUserNamePasswordLogin(username: string, password: string) {
    const MAX_ATTEMPTS = 5;
    const BLOCK_TIME = 10 * 60 * 1000;

    try {
      const user = await this.userService.findByUsername(username);

      if (!user) {
        return {
          isSuccessful: false,
          message: 'User not found',
          content: null,
        };
      }

      if (user.isBlacklisted) {
        return {
          isSuccessful: false,
          message: 'This Account is blacklisted, Please contact admin',
          content: null,
        };
      }

      if (user.role !== 'admin' && user.role !== 'superAdmin') {
        return {
          isSuccessful: false,
          message: 'You are not authorized to login',
          content: null,
        };
      }

      const currentTime = Date.now();
      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        const timeSinceLastAttempt =
          currentTime - Number(user.lastFailedLoginAttempt || 0);

        if (timeSinceLastAttempt < BLOCK_TIME) {
          const remainingTimeInMinandSec = BLOCK_TIME - timeSinceLastAttempt;
          const remainingTime = remainingTimeInMinandSec / 1000;
          const minutes = Math.floor(remainingTime / 60);
          const seconds = Math.floor(remainingTime % 60);
          return {
            isSuccessful: false,
            message: `Too many login attempts. Try again in ${minutes} minutes and ${seconds} seconds.`,
            content: null,
          };
        } else {
          user.failedLoginAttempts = 0;
        }
      }

      const isPasswordValid = await this.userService.validatePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        user.failedLoginAttempts += 1;
        user.lastFailedLoginAttempt = new Date(currentTime);

        await this.userService.update(user.id, user);

        return {
          isSuccessful: false,
          message: 'Username or password is incorrect',
          content: null,
        };
      }

      user.failedLoginAttempts = 0;
      user.lastFailedLoginAttempt = new Date(0);
      user.lastLogin = new Date(currentTime);

      const userDetails = {
        id: user.id,
        email: user.email,
        name: user.name,
        ...(user.isFirstLogin && { isFirstLogin: true }),
      };

      if (user.isFirstLogin) {
        user.isFirstLogin = false;
      }

      await this.userService.update(user.id, user);

      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };

      return {
        isSuccessful: true,
        message: 'Login successful',
        content: {
          token: this.jwtService.sign(payload),
          user: userDetails,
        },
      };
    } catch (error) {
      console.error('Admin login error:', error);
      if (error instanceof HttpException) {
        return {
          isSuccessful: false,
          message: error.message,
          content: null,
        };
      }

      return {
        isSuccessful: false,
        message: 'Something went wrong',
        content: null,
      };
    }
  }
}
