import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

export interface GamePackage {
  id: string;
  gameId: string;
  type: 'uc' | 'nabor' | 'stars' | 'premium' | 'gift';
  name: string;
  amount: number | string;
  unit: string;
  bonus?: number | string;
  price: number;
  oldPrice?: number;
  badge?: 'popular' | 'best_value';
  inStock: boolean;
  region?: string;
  description?: string;
}

@Injectable()
export class GamesService {
  private gamesData: Record<string, any> = {
    'pubg-mobile': {
      id: 'pubg-mobile',
      name: 'PUBG Mobile',
      category: 'game',
      regions: ['Global', 'Turkey', 'PH/MY'],
      tabs: ['UC', 'Nabor'],
      packages: [
        {
          id: 'pubg-60',
          gameId: 'pubg-mobile',
          type: 'uc',
          name: '60 UC',
          amount: 60,
          unit: 'UC',
          price: 12000,
          inStock: true,
        },
        {
          id: 'pubg-325',
          gameId: 'pubg-mobile',
          type: 'uc',
          name: '325 UC',
          amount: 325,
          unit: 'UC',
          bonus: '25 UC',
          price: 65000,
          oldPrice: 72000,
          badge: 'popular',
          inStock: true,
        },
        {
          id: 'pubg-660',
          gameId: 'pubg-mobile',
          type: 'uc',
          name: '660 UC',
          amount: 660,
          unit: 'UC',
          bonus: '60 UC',
          price: 125000,
          oldPrice: 140000,
          badge: 'best_value',
          inStock: true,
        },
        {
          id: 'pubg-1800',
          gameId: 'pubg-mobile',
          type: 'uc',
          name: '1800 UC',
          amount: 1800,
          unit: 'UC',
          bonus: '300 UC',
          price: 340000,
          inStock: false, // out of stock sinovi uchun
        },
        {
          id: 'pubg-3850',
          gameId: 'pubg-mobile',
          type: 'uc',
          name: '3850 UC',
          amount: 3850,
          unit: 'UC',
          bonus: '850 UC',
          price: 710000,
          oldPrice: 790000,
          inStock: true,
        },
        {
          id: 'pubg-8100',
          gameId: 'pubg-mobile',
          type: 'uc',
          name: '8100 UC',
          amount: 8100,
          unit: 'UC',
          bonus: '2100 UC',
          price: 1420000,
          inStock: true,
        },
        // Naborlar
        {
          id: 'pubg-rp',
          gameId: 'pubg-mobile',
          type: 'nabor',
          name: 'Royale Pass A10',
          amount: 'Royale Pass',
          unit: 'A10',
          price: 135000,
          badge: 'popular',
          inStock: true,
        },
        {
          id: 'pubg-eliterp',
          gameId: 'pubg-mobile',
          type: 'nabor',
          name: 'Elite Pass Plus',
          amount: 'Elite Pass Plus',
          unit: 'A10',
          bonus: '25 Level',
          price: 350000,
          inStock: true,
        },
      ],
    },
    'telegram-stars': {
      id: 'telegram-stars',
      name: 'Telegram',
      category: 'service',
      tabs: ['Stars', 'Premium', 'Sovg\'alar'],
      packages: [
        {
          id: 'tg-stars-50',
          gameId: 'telegram-stars',
          type: 'stars',
          name: '50 Stars',
          amount: 50,
          unit: 'Stars',
          price: 18000,
          inStock: true,
        },
        {
          id: 'tg-stars-100',
          gameId: 'telegram-stars',
          type: 'stars',
          name: '100 Stars',
          amount: 100,
          unit: 'Stars',
          price: 35000,
          badge: 'popular',
          inStock: true,
        },
        {
          id: 'tg-stars-250',
          gameId: 'telegram-stars',
          type: 'stars',
          name: '250 Stars',
          amount: 250,
          unit: 'Stars',
          price: 85000,
          inStock: true,
        },
        {
          id: 'tg-stars-500',
          gameId: 'telegram-stars',
          type: 'stars',
          name: '500 Stars',
          amount: 500,
          unit: 'Stars',
          price: 168000,
          badge: 'best_value',
          inStock: true,
        },
        {
          id: 'tg-stars-1000',
          gameId: 'telegram-stars',
          type: 'stars',
          name: '1000 Stars',
          amount: 1000,
          unit: 'Stars',
          price: 330000,
          inStock: true,
        },
        // Premium
        {
          id: 'tg-prem-3',
          gameId: 'telegram-stars',
          type: 'premium',
          name: 'Telegram Premium 3 oy',
          amount: 3,
          unit: 'oy',
          price: 135000,
          inStock: true,
        },
        {
          id: 'tg-prem-6',
          gameId: 'telegram-stars',
          type: 'premium',
          name: 'Telegram Premium 6 oy',
          amount: 6,
          unit: 'oy',
          bonus: '10% tejash',
          price: 245000,
          badge: 'popular',
          inStock: true,
        },
        {
          id: 'tg-prem-12',
          gameId: 'telegram-stars',
          type: 'premium',
          name: 'Telegram Premium 12 oy',
          amount: 12,
          unit: 'oy',
          bonus: '25% tejash',
          price: 430000,
          badge: 'best_value',
          inStock: true,
        },
        // Sovg'alar
        {
          id: 'tg-gift-teddy',
          gameId: 'telegram-stars',
          type: 'gift',
          name: 'Teddy Bear',
          amount: 'Teddy Bear',
          unit: 'Gift',
          price: 45000,
          inStock: true,
        },
        {
          id: 'tg-gift-cup',
          gameId: 'telegram-stars',
          type: 'gift',
          name: 'Star Trophy',
          amount: 'Star Trophy',
          unit: 'Gift',
          price: 85000,
          badge: 'popular',
          inStock: true,
        },
        {
          id: 'tg-gift-rose',
          gameId: 'telegram-stars',
          type: 'gift',
          name: 'Magic Rose',
          amount: 'Magic Rose',
          unit: 'Gift',
          price: 120000,
          inStock: false,
        },
      ],
    },
  };

  async getGame(slug: string) {
    const game = this.gamesData[slug];
    if (!game) {
      // Default fallback for other games
      return {
        id: slug,
        name: slug.replace('-', ' ').toUpperCase(),
        category: 'game',
        tabs: ['Standart'],
        packages: [
          {
            id: `${slug}-1`,
            gameId: slug,
            type: 'uc',
            name: 'Kichik to\'plam',
            amount: 100,
            unit: 'Valyuta',
            price: 20000,
            inStock: true,
          },
          {
            id: `${slug}-2`,
            gameId: slug,
            type: 'uc',
            name: 'Katta to\'plam',
            amount: 500,
            unit: 'Valyuta',
            price: 90000,
            badge: 'best_value',
            inStock: true,
          },
        ],
      };
    }
    return game;
  }

  // Jonli tekshiruv (3 holat: to'g'ri / noto'g'ri / server xatosi)
  async validatePlayerId(gameId: string, playerId: string, serverId = 'Global') {
    const cleanId = playerId.trim();

    // 1. Server xatosi simulyatsiyasi
    if (cleanId === '500' || cleanId.toLowerCase() === 'error') {
      throw new HttpException(
        'O\'yin serveri vaqtincha javob bermayapti. Birozdan so\'ng qayta urinib ko\'ring.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 2. Noto'g'ri ID simulyatsiyasi
    if (
      cleanId === '999' ||
      cleanId.startsWith('00') ||
      cleanId.toLowerCase() === 'invalid' ||
      cleanId.length < 5
    ) {
      return {
        valid: false,
        error: 'ID topilmadi. Raqamlarni tekshirib, qayta kiriting.',
      };
    }

    // 3. To'g'ri tasdiqlangan ID
    const isTelegram = gameId === 'telegram-stars';
    return {
      valid: true,
      nickname: isTelegram ? (cleanId.startsWith('@') ? cleanId : `@${cleanId}`) : 'NightHawk_UZ',
      server: isTelegram ? 'Telegram' : serverId,
    };
  }

  // Jonli Stars narx hisobi (min 50, max 1000)
  calculateStarsPrice(count: number): { count: number; price: number } {
    const safeCount = Math.max(50, Math.min(1000, count));
    // 1 Stars = ~350 so'm
    const price = safeCount * 350;
    return { count: safeCount, price };
  }
}
