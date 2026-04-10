import { Module } from '@nestjs/common';
import { AcademiesController } from './academies.controller.js';
import { AcademiesService } from './academies.service.js';

@Module({
  controllers: [AcademiesController],
  providers: [AcademiesService],
})
export class AcademiesModule {}
