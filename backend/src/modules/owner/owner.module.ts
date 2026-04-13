import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller.js';
import { OwnerService } from './owner.service.js';
import { EvaluationsModule } from '../evaluations/evaluations.module.js';

@Module({
  imports: [EvaluationsModule],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
