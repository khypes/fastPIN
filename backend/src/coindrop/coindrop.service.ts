import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Redis } from 'ioredis';
import { timingSafeEqual } from 'crypto';

export interface CoinDropGame {
  key: string;
  name: string;
  image_url?: string;
  image?: string;
  id_type: 'numeric' | 'text';
  amount_based: boolean;
  requires_server: boolean;
  has_validator: boolean;
}

export interface CoinDropProduct {
  id: string;
  name: string;
  description?: string;
  retail_usd: number;
  retail_uzs: number;
  price_usd: number;
  price_uzs: number;
  image_url?: string;
  image?: string;
  amount?: number;
  is_subscription?: boolean;
}

export interface CoinDropOrderRequest {
  game_key: string;
  product_id?: string;
  amount?: number;
  player_id: string;
  server_id?: string;
  external_ref: string;
  notification_url?: string;
}

export interface CoinDropOrderResponse {
  id: string;
  status: 'pending' | 'processing' | 'delivered' | 'failed' | 'cancelled';
  game_key: string;
  product_id?: string;
  amount?: number;
  player_id: string;
  server_id?: string;
  external_ref: string;
  created_at: string;
}

export interface CoinDropValidationRequest {
  game_key: string;
  player_id: string;
  server_id?: string;
}

export interface CoinDropValidationResponse {
  valid: boolean;
  player_name?: string;
  error?: string;
}

export interface CoinDropBalanceResponse {
  balance_usd: number;
  balance_uzs: number;
}

@Injectable()
export class CoinDropService {
  private readonly logger = new Logger(CoinDropService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly webhookSecret: string;
  private redis: Redis | null = null;
  private redisAvailable = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('COINDROP_BASE_URL') || 'https://api.coindrop.io';
    this.apiKey = this.configService.get<string>('COINDROP_API_KEY') || '';
    this.webhookSecret = this.configService.get<string>('COINDROP_WEBHOOK_SECRET') || '';

    // Initialize Redis with error handling
    // Redis ixtiyoriy: REDIS_URL (masalan Upstash) yoki REDIS_HOST berilmasa kesh o'chiq.
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      const redisHost = this.configService.get<string>('REDIS_HOST');
      if (!redisUrl && !redisHost) throw new Error('Redis not configured');
      const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;
      const opts = { lazyConnect: false, maxRetriesPerRequest: 1, enableOfflineQueue: false };
      this.redis = redisUrl
        ? new Redis(redisUrl, opts)
        : new Redis({ host: redisHost, port: redisPort, ...opts });
      
      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.redisAvailable = true;
      });
      
      this.redis.on('error', (err) => {
        this.logger.warn('Redis connection failed, caching disabled:', err.message);
        this.redisAvailable = false;
      });
    } catch (error) {
      this.logger.warn('Redis initialization failed, caching disabled');
      this.redisAvailable = false;
    }
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.redisAvailable || !this.redis) return null;
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn('Cache read failed:', error);
      return null;
    }
  }

  private async setCache<T>(key: string, value: T, ttl: number = 900): Promise<void> {
    if (!this.redisAvailable || !this.redis) return;
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.warn('Cache write failed:', error);
    }
  }

  private get headers() {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getGames(): Promise<CoinDropGame[]> {
    const cacheKey = 'coindrop:games';

    try {
      const cached = await this.getFromCache<CoinDropGame[]>(cacheKey);
      if (cached) {
        this.logger.log('Returning cached games');
        return cached;
      }

      const response: AxiosResponse<CoinDropGame[]> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/games`, {
          headers: this.headers,
        }),
      );

      const games = response.data;

      await this.setCache(cacheKey, games, 900);

      return games;
    } catch (error) {
      this.handleError(error, 'Failed to fetch games');
    }
  }

  async getProducts(gameKey: string): Promise<CoinDropProduct[]> {
    const cacheKey = `coindrop:products:${gameKey}`;

    try {
      const cached = await this.getFromCache<CoinDropProduct[]>(cacheKey);
      if (cached) {
        this.logger.log(`Returning cached products for ${gameKey}`);
        return cached;
      }

      const response: AxiosResponse<CoinDropProduct[]> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/games/${gameKey}/products`, {
          headers: this.headers,
        }),
      );

      const products = response.data;

      await this.setCache(cacheKey, products, 900);

      return products;
    } catch (error) {
      this.handleError(error, `Failed to fetch products for ${gameKey}`);
    }
  }

  async validatePlayer(
    gameKey: string,
    playerId: string,
    serverId?: string,
  ): Promise<CoinDropValidationResponse> {
    try {
      const payload: CoinDropValidationRequest = { game_key: gameKey, player_id: playerId };
      if (serverId) {
        payload.server_id = serverId;
      }

      const response: AxiosResponse<CoinDropValidationResponse> =
        await firstValueFrom(
          this.httpService.post(
            `${this.baseUrl}/games/${gameKey}/validate`,
            payload,
            { headers: this.headers },
          ),
        );

      return response.data;
    } catch (error) {
      this.handleError(error, `Failed to validate player ${playerId}`);
    }
  }

  async createOrder(
    orderData: CoinDropOrderRequest,
  ): Promise<CoinDropOrderResponse> {
    try {
      const response: AxiosResponse<CoinDropOrderResponse> =
        await firstValueFrom(
          this.httpService.post(`${this.baseUrl}/orders`, orderData, {
            headers: this.headers,
          }),
        );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create order');
    }
  }

  async getOrderStatus(orderId: string): Promise<CoinDropOrderResponse> {
    try {
      const response: AxiosResponse<CoinDropOrderResponse> =
        await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/orders/${orderId}`, {
            headers: this.headers,
          }),
        );

      return response.data;
    } catch (error) {
      this.handleError(error, `Failed to get order status for ${orderId}`);
    }
  }

  async getBalance(): Promise<CoinDropBalanceResponse> {
    try {
      const response: AxiosResponse<CoinDropBalanceResponse> =
        await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/account/balance`, {
            headers: this.headers,
          }),
        );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch CoinDrop balance');
    }
  }

  async getAccount(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/account`, {
          headers: this.headers,
        }),
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch CoinDrop account info');
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Secret sozlanmagan bo'lsa HECH QACHON qabul qilinmaydi.
    // Eslatma: CoinDrop hujjatidagi imzo sxemasiga (oddiy secret yoki HMAC) moslang.
    if (!this.webhookSecret || !signature) return false;
    const a = Buffer.from(signature);
    const b = Buffer.from(this.webhookSecret);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  private handleError(error: any, message: string): never {
    this.logger.error(message, error.response?.data || error.message);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 422:
          throw new HttpException(
            {
              message: message,
              details:
                data?.message || 'Invalid request data or insufficient balance',
              code: 'VALIDATION_ERROR',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        case 429:
          throw new HttpException(
            {
              message: 'Rate limit exceeded. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        case 503:
          throw new HttpException(
            {
              message:
                'Service temporarily unavailable. Please try again later.',
              code: 'SERVICE_UNAVAILABLE',
            },
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        default:
          throw new HttpException(
            {
              message: message,
              details: data?.message || error.message,
            },
            status,
          );
      }
    }

    throw new HttpException(
      { message: message, details: error.message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
