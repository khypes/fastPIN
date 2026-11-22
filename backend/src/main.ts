import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './setup';

process.on('unhandledRejection', (reason: any) => {
  console.warn('[Global Guard] Unhandled Rejection intercepted:', reason?.message || reason);
});

process.on('uncaughtException', (err: any) => {
  console.warn('[Global Guard] Uncaught Exception intercepted:', err?.message || err);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 FastPAY Backend running on port ${port}`);
}
bootstrap();
