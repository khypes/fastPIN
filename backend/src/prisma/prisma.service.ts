import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url && process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const pool = new Pool({
      connectionString:
        url || 'postgresql://postgres:postgres@localhost:5432/fastpay',
      // Serverless (Vercel): har instansiya uchun kam ulanish
      max: process.env.VERCEL ? 3 : 10,
    });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
