import { Module } from '@nestjs/common';
import { PlanGuardModule } from '../plan-guard/plan-guard.module.js';
import { TeamsController } from './teams.controller.js';
import { TeamsService } from './teams.service.js';

@Module({
  imports: [PlanGuardModule],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
