import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationMetric } from './entities/evaluation-metric.entity';
import { EvaluationScore } from './entities/evaluation-score.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluation, EvaluationMetric, EvaluationScore]),
  ],
  exports: [TypeOrmModule],
})
export class EvaluationsModule {}
