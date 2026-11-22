import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletService, PaymentMethod } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.walletService.getBalance(userId);
  }

  @Get('payment-methods')
  getPaymentMethods() {
    return this.walletService.getPaymentMethods();
  }

  @Post('topup/session')
  @HttpCode(HttpStatus.OK)
  async createSession(
    @Request() req: any,
    @Body()
    body: {
      amount: number;
      method: PaymentMethod;
      idempotencyKey: string;
      userId?: string;
    },
  ) {
    const userId = req.user?.id || body.userId || 'demo-user-id';
    return this.walletService.createTopupSession(
      userId,
      Number(body.amount),
      body.method,
      body.idempotencyKey,
    );
  }

  @Get('topup/session/:id')
  async getSession(@Request() req: any, @Param('id') sessionId: string) {
    const userId = req.user?.id || 'demo-user-id';
    return this.walletService.getSessionStatus(userId, sessionId);
  }

  // DEV ONLY: Confirm topup directly without admin dashboard
  @Post('dev/confirm-topup')
  @HttpCode(HttpStatus.OK)
  async devConfirm(@Body() body: { sessionId: string; secret?: string }) {
    return this.walletService.devConfirmTopup(body.sessionId, body.secret);
  }
}
