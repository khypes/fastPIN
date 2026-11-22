import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { CoinDropService } from '../coindrop/coindrop.service';
import { OrdersService } from './orders.service';

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
export class WebhookController {
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
