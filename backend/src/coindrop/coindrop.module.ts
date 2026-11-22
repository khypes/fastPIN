import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CoinDropService } from './coindrop.service';
import { CoinDropController } from './coindrop.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [CoinDropController],
  providers: [CoinDropService],
  exports: [CoinDropService],
})
export class CoinDropModule {}
