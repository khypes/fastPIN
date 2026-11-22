// Ishlatish (parol kodga yozilmaydi):
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='uzun-parol' npx ts-node create-admin.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';
import * as argon2 from 'argon2';

async function bootstrap() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('ADMIN_EMAIL va ADMIN_PASSWORD berilishi shart.');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Parol kamida 12 belgidan iborat bo\'lsin.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const prisma = app.get(PrismaService);

  try {
    const passwordHash = await argon2.hash(password);
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash, isActive: true },
      create: {
        email,
        passwordHash,
        role: 'SUPERADMIN',
        isActive: true,
        totpSecret: '',
      },
    });
    console.log(`Admin tayyor: ${email}`);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}
bootstrap();
