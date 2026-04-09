import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { PlayerParent } from './entities/player-parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerParent])],
  exports: [TypeOrmModule],
})
export class PlayersModule {}
