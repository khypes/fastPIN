import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.id;
    return this.ordersService.findAll(userId);
  }

  // FastPAY Mini App: Buyurtmalar tarixi
  @Get('history')
  async getHistory(@Request() req: any) {
    const userId = req.user.id;
    return this.ordersService.getMyOrdersHistory(userId);
  }

  // FastPAY Mini App: Checkout Game Package
  @Post('checkout')
  async checkout(
    @Request() req: any,
    @Body()
    body: {
      gameId: string;
      gameTitle?: string;
      packageId: string;
      packageName: string;
      amount: number;
      playerId: string;
      playerNickname?: string;
      serverId?: string;
      promoCode?: string;
      idempotencyKey?: string;
    },
  ) {
    const userId = req.user.id;
    return this.ordersService.checkoutFastPay(userId, body);
  }

  // FastPAY Mini App: Order details and delivery status
  @Get(':id/status')
  async getStatus(@Param('id') orderId: string) {
    return this.ordersService.getOrderDetails(orderId);
  }

  // FastPAY Mini App: Dev refund test
  @Post(':id/simulate-refund')
  async simulateRefund(@Param('id') orderId: string) {
    return this.ordersService.simulateRefund(orderId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') orderId: string) {
    const userId = req.user.id;
    return this.ordersService.findOne(userId, orderId);
  }

  @Post()
  async createOrder(@Request() req: any, @Body('accountId') accountId: string) {
    const userId = req.user.id;
    return this.ordersService.createOrder(userId, accountId);
  }

  @Post('coindrop')
  async createCoinDropOrder(
    @Request() req: any,
    @Body()
    body: {
      gameKey: string;
      productId?: string;
      amount?: number;
      playerId: string;
      serverId?: string;
    },
  ) {
    const userId = req.user.id;
    return this.ordersService.createCoinDropOrder(
      userId,
      body.gameKey,
      body.productId || null,
      body.amount || null,
      body.playerId,
      body.serverId,
    );
  }

  @Post(':id/confirm')
  async confirmOrder(@Request() req: any, @Param('id') orderId: string) {
    const userId = req.user.id;
    return this.ordersService.confirmOrder(userId, orderId);
  }

  @Post(':id/dispute')
  async disputeOrder(@Request() req: any, @Param('id') orderId: string) {
    const userId = req.user.id;
    return this.ordersService.disputeOrder(userId, orderId);
  }
}
