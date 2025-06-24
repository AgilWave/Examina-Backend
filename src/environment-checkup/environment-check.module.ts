import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentCheckupController } from './environment-checkup.controller';
import { EnvironmentCheckupService } from './environment-checkup.service';
import { EnvironmentCheck } from './entities/environment-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnvironmentCheck]), ConfigModule],
  controllers: [EnvironmentCheckupController],
  providers: [EnvironmentCheckupService],
  exports: [EnvironmentCheckupService],
})
export class EnvironmentCheckupModule {}
