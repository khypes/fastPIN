import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

/** main.ts (lokal/server) va serverless.ts (Vercel) uchun umumiy sozlamalar */
export function configureApp(app: INestApplication) {
  const isProd = process.env.NODE_ENV === 'production';
  // FRONTEND_URL: bitta yoki vergul bilan ajratilgan bir nechta origin
  const origins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({
    // Productionda FRONTEND_URL berilmasa hech qaysi origin ruxsat etilmaydi
    origin: origins.length ? origins : isProd ? false : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
}
