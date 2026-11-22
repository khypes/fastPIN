import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PaymentProvider } from '@prisma/client';

export type PaymentMethod = 'UZCARD_HUMO' | 'PAYME' | 'CLICK' | 'UZQR';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  label: string;
  description: string;
  fee: string;
  time: string;
  recommended: boolean;
  enabled: boolean;
  cardNumber?: string;
  cardHolder?: string;
}

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // Get user balance and recent transactions
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        balance: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            type: true,
            amount: true,
            balanceAfter: true,
            status: true,
            createdAt: true,
            paymentProvider: true,
            orderId: true,
          },
        },
      },
    });
    if (!user) {
      // Create guest/mock if user not found for seamless preview
      return {
        balance: 45000,
        transactions: [
          {
            id: 'tx-mock-1',
            type: 'TOPUP',
            amount: 50000,
            balanceAfter: 50000,
            status: 'COMPLETED',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            paymentProvider: 'UZCARD_HUMO',
            orderId: null,
          },
          {
            id: 'tx-mock-2',
            type: 'ESCROW_HOLD',
            amount: 5000,
            balanceAfter: 45000,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
            paymentProvider: null,
            orderId: 'ord-mock-pubg',
          },
        ],
      };
    }
    return {
      balance: Number(user.balance),
      transactions: user.transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
        balanceAfter: Number(tx.balanceAfter),
      })),
    };
  }

  // Get available payment methods (with fee/time transparency)
  getPaymentMethods(): PaymentMethodInfo[] {
    return [
      {
        id: 'UZCARD_HUMO',
        label: 'Uzcard / Humo',
        description: "Bank ilovasi yoki kartadan to'g'ridan-to'g'ri o'tkazma",
        fee: "0% komissiya",
        time: "1–3 daqiqa",
        recommended: true,
        enabled: true,
        cardNumber: '8600 5304 9120 7841',
        cardHolder: 'FastPAY MCHJ',
      },
      {
        id: 'PAYME',
        label: 'Payme',
        description: "Payme ilovasi orqali 1 teginishda",
        fee: "0% komissiya",
        time: "Darhol",
        recommended: false,
        enabled: false,
      },
      {
        id: 'CLICK',
        label: 'Click Up',
        description: "Click Evolution yoki Telegram bot orqali",
        fee: "0% komissiya",
        time: "Darhol",
        recommended: false,
        enabled: false,
      },
      {
        id: 'UZQR',
        label: 'UzQR',
        description: "Barcha bank ilovalari orqali QR skaner",
        fee: "0% komissiya",
        time: "1 daqiqa",
        recommended: false,
        enabled: false,
      },
    ];
  }

  // Create a pending topup session (idempotent via idempotencyKey)
  async createTopupSession(
    userId: string,
    amount: number,
    method: PaymentMethod,
    idempotencyKey: string,
  ) {
    if (amount < 10000) {
      throw new BadRequestException("Minimal to'lov miqdori 10 000 so'm");
    }
    if (amount > 10000000) {
      throw new BadRequestException("Maksimal to'lov miqdori 10 000 000 so'm");
    }

    let user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // In case guest mode is used
      user = await this.prisma.user.findFirst();
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: `demo_${Date.now()}`,
            firstName: 'Demo Foydalanuvchi',
            balance: new Prisma.Decimal(0),
          },
        });
      }
      userId = user.id;
    }

    // Check existing session with same idempotencyKey (stored in userComment)
    if (idempotencyKey) {
      const existing = await this.prisma.topUpRequest.findFirst({
        where: { userId, userComment: idempotencyKey },
      });
      if (existing) {
        return {
          sessionId: existing.id,
          status: existing.status,
          idempotent: true,
          amount: Number(existing.amount),
        };
      }
    }

    const providerMap: Record<PaymentMethod, PaymentProvider> = {
      UZCARD_HUMO: PaymentProvider.UZCARD_HUMO,
      PAYME: PaymentProvider.PAYME,
      CLICK: PaymentProvider.CLICK,
      UZQR: PaymentProvider.UZCARD_HUMO,
    };

    const session = await this.prisma.topUpRequest.create({
      data: {
        userId,
        amount: new Prisma.Decimal(amount),
        method: providerMap[method] || PaymentProvider.UZCARD_HUMO,
        userComment: idempotencyKey || undefined,
        status: 'PENDING',
      },
    });

    return {
      sessionId: session.id,
      status: 'PENDING',
      idempotent: false,
      amount,
    };
  }

  // Get session status
  async getSessionStatus(userId: string, sessionId: string) {
    const session = await this.prisma.topUpRequest.findFirst({
      where: { id: sessionId },
    });
    if (!session) {
      throw new BadRequestException("To'lov sessiyasi topilmadi");
    }
    return {
      sessionId: session.id,
      status: session.status,
      amount: Number(session.amount),
      method: session.method,
      createdAt: session.createdAt,
    };
  }

  // DEV/TEST ONLY: Confirm topup simulation (like an instant payment webhook)
  async devConfirmTopup(sessionId: string, adminSecret?: string) {
    if (adminSecret && adminSecret !== 'fastpay-dev-secret-2026') {
      throw new BadRequestException('Noto\'g\'ri secret');
    }

    const session = await this.prisma.topUpRequest.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new BadRequestException('Sessiya topilmadi');
    if (session.status !== 'PENDING') {
      return {
        success: true,
        alreadyProcessed: true,
        status: session.status,
      };
    }

    // DB transaction: update topUpRequest + create ledger Transaction + increment user balance
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.topUpRequest.update({
        where: { id: sessionId },
        data: { status: 'APPROVED', reviewedAt: new Date() },
      });

      const user = await tx.user.findUnique({ where: { id: session.userId } });
      const currentBalance = Number(user?.balance || 0);
      const newBalance = currentBalance + Number(session.amount);

      const txRecord = await tx.transaction.create({
        data: {
          userId: session.userId,
          type: 'TOPUP',
          amount: session.amount,
          balanceAfter: new Prisma.Decimal(newBalance),
          paymentProvider: session.method,
          status: 'COMPLETED',
          providerTransactionId: `tx-topup-${sessionId}`,
        },
      });

      await tx.user.update({
        where: { id: session.userId },
        data: { balance: new Prisma.Decimal(newBalance) },
      });

      return { newBalance, transactionId: txRecord.id };
    });

    return {
      success: true,
      status: 'APPROVED',
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    };
  }
}
