import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
  constructor(
    private readonly botService: BotService,
    private readonly configService: ConfigService,
  ) {}

  // Telegram webhook. setWebhook da secret_token berilishi SHART.
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') secret?: string,
  ) {
    const expected = this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET');
    if (!expected || !secret) throw new UnauthorizedException();
    const a = Buffer.from(secret);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException();
    }
    await this.botService.handleUpdate(update);
    return { ok: true };
  }
}
