import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Logger
  app.useLogger(app.get(Logger));

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || '/v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Cronia API')
    .setDescription('Cronia - Credit collateralized platform on Solana')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('consumers', 'Consumer management')
    .addTag('merchants', 'Merchant management')
    .addTag('checkout', 'Checkout and payment sessions')
    .addTag('receivables', 'Receivables management')
    .addTag('billing', 'Billing and invoices')
    .addTag('collateral', 'Collateral deposits')
    .addTag('admin', 'Administrative endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start server
  const port = process.env.API_PORT || 3000;
  const host = process.env.API_HOST || '0.0.0.0';

  await app.listen(port, host);

  console.log(`
  ╔═══════════════════════════════════════╗
  ║     🚀 Cronia API is running!        ║
  ╠═══════════════════════════════════════╣
  ║  Server: http://${host}:${port}     ║
  ║  API Docs: http://localhost:${port}/docs  ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}    ║
  ╚═══════════════════════════════════════╝
  `);
}

bootstrap();
