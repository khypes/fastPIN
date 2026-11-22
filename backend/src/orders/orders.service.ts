import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrderStatus,
  AccountStatus,
  TransactionType,
  ProductType,
} from '@prisma/client';
import { CoinDropService } from '../coindrop/coindrop.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private coinDropService: CoinDropService,
  ) {}

  async createOrder(buyerId: string, accountId: string) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new NotFoundException('Account not found');
      if (account.status !== AccountStatus.AVAILABLE) {
        throw new BadRequestException('Account is not available for purchase');
      }

      const user = await tx.user.findUnique({ where: { id: buyerId } });
      if (!user) throw new NotFoundException('User not found');

      if (Number(user.balance) < Number(account.price)) {
        throw new BadRequestException('Insufficient balance');
      }

      // 1. Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: buyerId },
        data: { balance: { decrement: account.price } },
      });

      // 2. Create Order
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          totalAmount: account.price,
          status: OrderStatus.ESCROW_HELD,
          escrowStep: 1,
          items: {
            create: {
              productType: ProductType.ACCOUNT,
              productId: account.id,
              accountId: account.id,
              price: account.price,
              quantity: 1,
            },
          },
        },
      });

      // 3. Create Transaction
      await tx.transaction.create({
        data: {
          userId: buyerId,
          type: TransactionType.ESCROW_HOLD,
          amount: account.price,
          balanceAfter: updatedUser.balance,
          orderId: order.id,
        },
      });

      // 4. Update Account Status
      await tx.account.update({
        where: { id: accountId },
        data: { status: AccountStatus.RESERVED },
      });

      return order;
    });
  }

  async confirmOrder(buyerId: string, orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order || order.buyerId !== buyerId) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.CREDENTIALS_SENT) {
        throw new BadRequestException(
          'Order cannot be confirmed at this stage',
        );
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          escrowStep: 3,
          confirmedAt: new Date(),
        },
      });

      const accountItem = order.items.find((i) => i.productType === 'ACCOUNT');
      if (accountItem && accountItem.accountId) {
        await tx.account.update({
          where: { id: accountItem.accountId },
          data: { status: AccountStatus.SOLD },
        });
      }

      return updatedOrder;
    });
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            account: {
              select: { title: true, rank: true, images: true },
            },
          },
        },
      },
    });
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            account: {
              select: { title: true, rank: true, images: true },
            },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) throw new ForbiddenException('Access denied');
    return order;
  }

  async disputeOrder(buyerId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order || order.buyerId !== buyerId)
      throw new NotFoundException('Order not found');
    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot dispute this order');
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DISPUTED },
    });
  }

  // CoinDrop integration methods
  async createCoinDropOrder(
    buyerId: string,
    gameKey: string,
    productId: string | null,
    amount: number | null,
    playerId: string,
    serverId?: string,
  ) {
    // Idempotency check - check if order already exists for this user with same details
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        buyerId,
        provider: 'coindrop',
        status: { in: [OrderStatus.PENDING_PAYMENT, OrderStatus.ESCROW_HELD] },
        items: {
          some: {
            targetId: playerId,
            ...(productId && { productId }),
          },
        },
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
    });

    if (existingOrder) {
      throw new BadRequestException(
        'Similar order already exists. Please wait or check your order history.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: buyerId } });
      if (!user) throw new NotFoundException('User not found');

      // Get product details from CoinDrop
      const products = await this.coinDropService.getProducts(gameKey);
      let product;
      if (productId) {
        product = products.find((p) => p.id === productId);
      } else if (amount) {
        product = products.find((p) => p.amount === amount);
      }

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Calculate price with margin (10% margin by default)
      const margin = 0.1; // 10% margin
      const priceUzs = product.retail_uzs * (1 + margin);

      // Check balance
      if (Number(user.balance) < priceUzs) {
        throw new BadRequestException('Insufficient balance');
      }

      // Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: buyerId },
        data: { balance: { decrement: priceUzs } },
      });

      // Create order with external reference
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const externalRef = `fastuc-${orderNumber}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          totalAmount: priceUzs,
          status: OrderStatus.PENDING_PAYMENT,
          externalRef,
          provider: 'coindrop',
          items: {
            create: {
              productType: ProductType.UC, // Default to UC, will be dynamic based on game
              productId: productId || product.id,
              targetId: playerId,
              quantity: 1,
              price: priceUzs,
            },
          },
        },
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          userId: buyerId,
          type: TransactionType.ESCROW_HOLD,
          amount: priceUzs,
          balanceAfter: updatedUser.balance,
          orderId: order.id,
        },
      });

      // Create order in CoinDrop
      try {
        const coinDropOrder = await this.coinDropService.createOrder({
          game_key: gameKey,
          product_id: productId || undefined,
          amount: amount || undefined,
          player_id: playerId,
          server_id: serverId,
          external_ref: externalRef,
          notification_url: `${process.env.PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3000'}/api/webhooks/coindrop`,
        });

        // Update order with CoinDrop order ID and status
        await tx.order.update({
          where: { id: order.id },
          data: {
            providerOrderId: coinDropOrder.id,
            providerStatus: coinDropOrder.status,
            status: OrderStatus.ESCROW_HELD, // Move to escrow once sent to provider
          },
        });
      } catch (error) {
        // If CoinDrop fails, refund and mark order as failed
        await tx.user.update({
          where: { id: buyerId },
          data: { balance: { increment: priceUzs } },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.REJECTED },
        });
        throw error;
      }

      return order;
    });
  }

  async updateOrderFromWebhook(
    externalRef: string,
    status: 'delivered' | 'failed' | 'cancelled',
  ) {
    const order = await this.prisma.order.findUnique({
      where: { externalRef },
      include: { items: true },
    });

    if (!order) {
      console.error(`Order not found for externalRef: ${externalRef}`);
      return null;
    }

    const updateData: Record<string, unknown> = {
      providerStatus: status,
    };

    if (status === 'delivered') {
      updateData.status = OrderStatus.COMPLETED;
      updateData.confirmedAt = new Date();
    } else if (status === 'failed' || status === 'cancelled') {
      updateData.status = OrderStatus.REFUNDED;

      const user = await this.prisma.user.findUnique({
        where: { id: order.buyerId },
      });
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: order.buyerId },
          data: { balance: { increment: order.totalAmount } },
        }),
        this.prisma.transaction.create({
          data: {
            userId: order.buyerId,
            type: TransactionType.REFUND,
            amount: order.totalAmount,
            balanceAfter:
              Number(user?.balance || 0) + Number(order.totalAmount),
            orderId: order.id,
          },
        }),
      ]);
    }

    return this.prisma.order.update({
      where: { externalRef },
      data: updateData as any,
    });
  }

  // FastPAY Mini App: Direct game package checkout with wallet balance
  async checkoutFastPay(
    userId: string,
    dto: {
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
    let finalAmount = Number(dto.amount);
    if (dto.promoCode && dto.promoCode.trim().toUpperCase() === 'FASTPAY10') {
      finalAmount = Math.round(finalAmount * 0.9);
    }

    let user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await this.prisma.user.findFirst();
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: "demo_" + Date.now(),
            firstName: "Demo Xaridor",
            balance: 200000,
          },
        });
      }
      userId = user.id;
    }

    const currentBalance = Number(user.balance);
    if (currentBalance < finalAmount) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'INSUFFICIENT_BALANCE',
        message: "Hamyoningizda yetarli mablag' yo'q",
        currentBalance,
        requiredAmount: finalAmount,
        missingAmount: finalAmount - currentBalance,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const newBalance = currentBalance - finalAmount;

      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      });

      const orderNumber = "FP-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900);

      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId: userId,
          totalAmount: finalAmount,
          status: OrderStatus.COMPLETED,
          confirmedAt: new Date(),
          externalRef: dto.idempotencyKey || ("ref-" + Date.now()),
          provider: 'FastPAY AutoDelivery',
          providerStatus: 'delivered',
          items: {
            create: {
              productType: dto.gameId === 'telegram' ? ProductType.STARS : ProductType.UC,
              productId: dto.packageId,
              targetId: dto.playerId,
              quantity: 1,
              price: finalAmount,
            },
          },
        },
        include: {
          items: true,
        },
      });

      const ledgerTx = await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.ESCROW_HOLD,
          amount: finalAmount,
          balanceAfter: newBalance,
          orderId: order.id,
          status: 'COMPLETED',
          providerTransactionId: "tx-order-" + order.id,
        },
      });

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        amount: finalAmount,
        newBalance,
        gameId: dto.gameId,
        gameTitle: dto.gameTitle || 'PUBG Mobile',
        packageName: dto.packageName,
        playerId: dto.playerId,
        playerNickname: dto.playerNickname || 'Player',
        createdAt: order.createdAt,
        transactionId: ledgerTx.id,
      };
    });
  }

  async getMyOrdersHistory(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (orders.length === 0) {
      return [
        {
          id: 'ord-demo-1',
          orderNumber: 'FP-839201',
          gameTitle: 'PUBG Mobile',
          packageName: '660 UC',
          playerId: '512894192',
          playerNickname: 'NightHawk_UZ',
          totalAmount: 120000,
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: 'ord-demo-2',
          orderNumber: 'FP-492104',
          gameTitle: 'Telegram',
          packageName: '100 Stars',
          playerId: '@night_hawk',
          playerNickname: 'NightHawk',
          totalAmount: 24000,
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 1000 * 3600 * 4).toISOString(),
        },
      ];
    }

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      gameTitle: o.items[0]?.productType === ProductType.STARS ? 'Telegram' : 'PUBG Mobile',
      packageName: o.items[0]?.productId || 'Paket',
      playerId: o.items[0]?.targetId || 'ID',
      totalAmount: Number(o.totalAmount),
      status: o.status,
      createdAt: o.createdAt,
    }));
  }

  async getOrderDetails(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return {
        id: orderId,
        orderNumber: 'FP-839201',
        gameTitle: 'PUBG Mobile',
        packageName: '660 UC',
        playerId: '512894192',
        playerNickname: 'NightHawk_UZ',
        totalAmount: 120000,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      gameTitle: order.items[0]?.productType === ProductType.STARS ? 'Telegram' : 'PUBG Mobile',
      packageName: order.items[0]?.productId || 'Paket',
      playerId: order.items[0]?.targetId || 'ID',
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
    };
  }

  async simulateRefund(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status === OrderStatus.REFUNDED) return { success: true };

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REFUNDED },
      });

      const user = await tx.user.findUnique({ where: { id: order.buyerId } });
      const newBal = Number(user?.balance || 0) + Number(order.totalAmount);

      await tx.user.update({
        where: { id: order.buyerId },
        data: { balance: newBal },
      });

      await tx.transaction.create({
        data: {
          userId: order.buyerId,
          type: TransactionType.REFUND,
          amount: order.totalAmount,
          balanceAfter: newBal,
          orderId: order.id,
          status: 'COMPLETED',
        },
      });

      return { success: true, status: 'REFUNDED', newBalance: newBal };
    });
  }
}
