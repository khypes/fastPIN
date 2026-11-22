import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

process.on('unhandledRejection', (reason: any) => {
  console.warn('[Global Guard] Unhandled Rejection intercepted:', reason?.message || reason);
});

process.on('uncaughtException', (err: any) => {
  console.warn('[Global Guard] Uncaught Exception intercepted:', err?.message || err);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 FastPAY Backend running on port ${port}`);
}
bootstrap();
