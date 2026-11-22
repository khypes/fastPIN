import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get(':id')
  async getGame(@Param('id') id: string) {
    return this.gamesService.getGame(id);
  }

  @Post('validate-player')
  async validatePlayer(
    @Body('gameId') gameId: string,
    @Body('playerId') playerId: string,
    @Body('serverId') serverId?: string,
  ) {
    return this.gamesService.validatePlayerId(gameId, playerId, serverId);
  }

  @Get('telegram/calculate-stars')
  calculateStars(@Query('count') count: string) {
    return this.gamesService.calculateStarsPrice(parseInt(count, 10) || 50);
  }
}
