import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evaluation } from './evaluation.entity';
import { EvaluationMetric } from './evaluation-metric.entity';

@Entity('evaluation_scores')
export class EvaluationScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  evaluationId: string;

  @Column()
  metricId: string;

  @Column()
  score: number;

  @ManyToOne(() => Evaluation, (evaluation) => evaluation.scores)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @ManyToOne(() => EvaluationMetric)
  @JoinColumn({ name: 'metric_id' })
  metric: EvaluationMetric;
}
