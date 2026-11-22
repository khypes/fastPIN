import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot | null = null;
  private readonly logger = new Logger(BotService.name);
  // Serverless (Vercel) da webhook ishlatiladi; handlerlar tugashini kutish uchun
  private readonly pending = new Set<Promise<unknown>>();

  /** Webhook rejimi: Vercel'da yoki TELEGRAM_WEBHOOK_SECRET berilganda polling o'chiq */
  get isWebhookMode(): boolean {
    return (
      !!process.env.VERCEL ||
      !!this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET')
    );
  }

  /** Telegram webhook'dan kelgan update'ni qayta ishlaydi va handlerlar tugashini kutadi */
  async handleUpdate(update: any): Promise<void> {
    if (!this.bot) return;
    this.bot.processUpdate(update);
    await Promise.allSettled([...this.pending]);
  }

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not defined. Bot will not start.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: false });

      // Handlerlar promise'larini kuzatish (webhook javobi handler tugagach qaytishi uchun)
      const track =
        (cb: any) =>
        (...args: any[]) => {
          const r = cb(...args);
          if (r && typeof r.then === 'function') {
            this.pending.add(r);
            r.finally(() => this.pending.delete(r));
          }
          return r;
        };
      const b: any = this.bot;
      const origOn = b.on.bind(b);
      b.on = (ev: string, cb: any) => origOn(ev, track(cb));
      const origOnText = b.onText.bind(b);
      b.onText = (re: RegExp, cb: any) => origOnText(re, track(cb));

      // Handle polling errors safely without crashing the backend
      this.bot.on('polling_error', (err: any) => {
        this.logger.warn(`Telegram polling warning: ${err?.message || err}`);
      });

      const webAppUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'https://fastpay.uz';

      this.bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const name = msg.from?.first_name || 'Foydalanuvchi';

        const text =
          `⚡️ <b>Xush kelibsiz, ${name}</b>\n\n` +
          `Bu <b>FastPAY</b> — donatni kutmasdan olishning eng tez yo'li.\n\n` +
          `⚡️ <b>Qulay interfeys</b>\n` +
          `⚡️ <b>Qulay to'lov</b>\n` +
          `⚡️ <b>To'liq avtomatlashtirilgan xizmat</b>\n\n` +
          `Pastdagi tugmani bosing va hoziroq boshlang 👇`;

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: '🛍 Xaridni boshlash',
                web_app: { url: webAppUrl },
              },
            ],
            [
              { text: '📢 Yangiliklar ↗', url: 'https://t.me/FastUC_news' },
              { text: '💬 Sharhlar ↗', url: 'https://t.me/FastUC_reviews' },
            ],
            [
              { text: '🎧 Qo\'llab-quvvatlash ↗', url: 'https://t.me/FastUC_support' },
            ],
          ],
        };

        await this.bot?.sendMessage(chatId, text, {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
      });

      this.bot.on('callback_query', async (query) => {
        const chatId = query.message?.chat.id;
        if (!chatId) return;

        if (query.data === 'change_lang') {
          await this.bot?.sendMessage(chatId, 'Iltimos, muloqot tilini tanlang:\nВыберите язык:', {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🇺🇿 O\'zbekcha', callback_data: 'lang_uz' },
                  { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
                  { text: '🇬🇧 English', callback_data: 'lang_en' },
                ],
              ],
            },
          });
        } else if (query.data?.startsWith('lang_')) {
          const lang = query.data.replace('lang_', '').toUpperCase();
          await this.bot?.answerCallbackQuery(query.id, { text: `Til tanlandi: ${lang}` });
          await this.bot?.sendMessage(chatId, `Til o'zgartirildi: ${lang}. Mini Appdan foydalanishingiz mumkin.`);
        } else if (query.data === 'reviews') {
          await this.bot?.answerCallbackQuery(query.id);
          await this.bot?.sendMessage(chatId, 'Mijozlarimiz sharhlari kanalida: https://t.me/fastpay_reviews');
        }
      });

      // Verify token first before starting polling or setting menu button
      this.bot.getMe()
        .then(() => {
          if (this.isWebhookMode) {
            // Webhook rejimi: polling va menu button sozlamasi deploy paytida
            // bir marta qilinadi (DEPLOY_VERCEL.md ga qarang).
            this.logger.log('Telegram bot ready (webhook mode)');
            return;
          }
          this.bot!.startPolling();
          this.logger.log('Telegram bot started successfully (polling)');

          try {
            (this.bot as any).setChatMenuButton({
              menu_button: JSON.stringify({
                type: 'web_app',
                text: 'Xaridni boshlash',
                web_app: { url: webAppUrl },
              }),
            }).catch((err: any) => {
              this.logger.warn(`Could not set chat menu button: ${err?.message}`);
            });
          } catch (err) {
            this.logger.warn('Could not set chat menu button', err);
          }
        })
        .catch((err: any) => {
          this.logger.warn(`Bot token invalid or network error (${err?.message}). Running in mock/API mode.`);
          this.bot = null;
        });
    } catch (e) {
      this.logger.error('Failed to initialize Telegram Bot', e);
    }
  }

  async notifyAdmin(message: string) {
    const adminChatId = this.configService.get<string>('ADMIN_CHAT_ID');
    if (this.bot && adminChatId) {
      try {
        await this.bot.sendMessage(adminChatId, message, { parse_mode: 'HTML' });
      } catch (error) {
        this.logger.error('Failed to notify admin', error);
      }
    }
  }

  async sendTopUpRequestToAdmin(
    requestId: string,
    user: any,
    amount: number,
    method: string,
    fileBuffer: Buffer,
  ) {
    const adminChatId = this.configService.get<string>('ADMIN_CHAT_ID');
    if (!this.bot || !adminChatId) return null;

    const formattedAmount = Number(amount).toLocaleString('uz-UZ');
    const time = new Date().toLocaleString('uz-UZ', {
      timeZone: 'Asia/Tashkent',
    });

    const caption =
      `<b>🆕 Yangi hisob to'ldirish so'rovi</b>\n` +
      `<b>👤 Foydalanuvchi:</b> ${user.username ? '@' + user.username : "Noma'lum"} (ID: ${user.telegramId})\n` +
      `<b>💰 Summa:</b> ${formattedAmount} UZS\n` +
      `<b>💳 Usul:</b> ${method}\n` +
      `<b>🕐 Vaqt:</b> ${time}\n\n` +
      `<b>⚙️ Admin paneldan ko'rib chiqing:</b> /admin`;

    try {
      const msg = await this.bot.sendPhoto(
        adminChatId,
        fileBuffer,
        { caption, parse_mode: 'HTML' },
        { filename: 'receipt.jpg', contentType: 'image/jpeg' },
      );
      const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null;
      return { messageId: msg.message_id, fileId };
    } catch (error) {
      this.logger.error('Failed to send receipt to admin', error);
      return null;
    }
  }

  async notifyUser(telegramId: string, message: string) {
    if (this.bot && telegramId) {
      try {
        await this.bot.sendMessage(telegramId, message, { parse_mode: 'HTML' });
      } catch (error) {
        this.logger.error(`Failed to notify user ${telegramId}`, error);
      }
    }
  }
}
