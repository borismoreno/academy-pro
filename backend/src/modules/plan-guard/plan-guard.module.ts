import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PlanGuardService } from './plan-guard.service.js';

@Module({
  imports: [PrismaModule],
  providers: [PlanGuardService],
  exports: [PlanGuardService],
})
export class PlanGuardModule {}
