import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { configureApp } from './setup';

// Vercel serverless entry. Instansiya "iliq" qolganda qayta ishlatiladi.
const server = express();
let ready: Promise<void> | null = null;

function bootstrap(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
        logger: ['error', 'warn', 'log'],
      });
      configureApp(app);
      await app.init();
    })().catch((err) => {
      ready = null; // keyingi so'rovda qayta urinish
      throw err;
    });
  }
  return ready;
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  return server(req, res);
}
