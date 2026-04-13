import { Module } from '@nestjs/common';
import { PlanGuardModule } from '../plan-guard/plan-guard.module.js';
import { FieldsController } from './fields.controller.js';
import { FieldsService } from './fields.service.js';

@Module({
  imports: [PlanGuardModule],
  controllers: [FieldsController],
  providers: [FieldsService],
})
export class FieldsModule {}
