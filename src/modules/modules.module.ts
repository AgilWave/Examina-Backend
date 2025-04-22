import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modules } from './entities/modules.entitiy';
import { Course } from '../course/entities/course.entitiy';
import { ModulesService } from './modules.service';
import { ModuleController } from './modules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Modules, Course])],
  controllers: [ModuleController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
