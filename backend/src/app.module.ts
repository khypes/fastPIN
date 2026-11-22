import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { AccountsModule } from './accounts/accounts.module';
import { TopupModule } from './topup/topup.module';
import { AdminModule } from './admin/admin.module';
import { BotModule } from './bot/bot.module';
import { CoinDropModule } from './coindrop/coindrop.module';
import { GamesModule } from './games/games.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BotModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    AccountsModule,
    TopupModule,
    AdminModule,
    CoinDropModule,
    GamesModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
