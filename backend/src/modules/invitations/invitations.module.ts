import { Module } from '@nestjs/common';
import { PlanGuardModule } from '../plan-guard/plan-guard.module.js';
import { InvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';

@Module({
  imports: [PlanGuardModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
