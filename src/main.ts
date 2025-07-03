import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { User } from './user/entities/user.entitiy';
import { Student } from './user/entities/student.entitiy';
import { Lecture } from './user/entities/lecture.entitiy';
import { ResponseList } from './response-dtos/responseList.dto';
import { ResponseContent } from './response-dtos/responseContent.dto';
import { PaginationInfo } from './response-dtos/pagination-response.dto';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Examina API')
    .setDescription('Examina API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      User,
      Student,
      Lecture,
      ResponseList,
      ResponseContent,
      PaginationInfo,
    ],
  });
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: -1,
      displayRequestDuration: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelRendering: 'example',
      useUnsafeMarkdown: true,
    },
  });
  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
}
void bootstrap();
