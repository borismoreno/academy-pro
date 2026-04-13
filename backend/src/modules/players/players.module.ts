import { Module } from '@nestjs/common';
import { PlanGuardModule } from '../plan-guard/plan-guard.module.js';
import { PlayersController } from './players.controller.js';
import { PlayersService } from './players.service.js';

@Module({
  imports: [PlanGuardModule],
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayersModule {}
