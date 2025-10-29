import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const prisma = app.get(PrismaService);
  await prisma.$connect();
  console.log('✅ Prisma conectado ao PostgreSQL');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
