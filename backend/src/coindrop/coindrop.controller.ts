import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CoinDropService } from './coindrop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from '../orders/orders.service';

interface CoinDropWebhookPayload {
  event: string;
  data: {
    order_id: string;
    external_ref: string;
    status: 'delivered' | 'failed' | 'cancelled';
    game_key: string;
    product_id?: string;
    amount?: number;
    player_id: string;
  };
}

@Controller('webhooks')
export class CoinDropWebhookController {
  constructor(
    private readonly coinDropService: CoinDropService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('coindrop')
  @HttpCode(HttpStatus.OK)
  async handleCoinDropWebhook(
    @Body() payload: CoinDropWebhookPayload,
    @Headers('x-webhook-signature') signature: string,
  ) {
    const isValid = this.coinDropService.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
    );

    if (!isValid) {
      console.error('Invalid webhook signature received');
      return { received: true, verified: false };
    }

    if (payload.event === 'order.updated') {
      const { external_ref, status } = payload.data;

      await this.ordersService.updateOrderFromWebhook(external_ref, status);

      console.log(`Order ${external_ref} status updated to ${status}`);
    }

    return { received: true, verified: true };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('coindrop')
export class CoinDropController {
  constructor(private readonly coinDropService: CoinDropService) {}

  @Get('games')
  async getGames() {
    return this.coinDropService.getGames();
  }

  @Get('games/:gameKey/products')
  async getProducts(@Param('gameKey') gameKey: string) {
    return this.coinDropService.getProducts(gameKey);
  }

  @Post('games/:gameKey/validate')
  async validatePlayer(
    @Param('gameKey') gameKey: string,
    @Body() body: { player_id: string; server_id?: string },
  ) {
    return this.coinDropService.validatePlayer(gameKey, body.player_id, body.server_id);
  }

  @Get('balance')
  async getBalance() {
    return this.coinDropService.getBalance();
  }
}
