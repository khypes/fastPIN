import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CoinDropModule } from '../coindrop/coindrop.module';
import { UsersModule } from '../users/users.module';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [CoinDropModule, UsersModule],
  controllers: [OrdersController, WebhookController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
