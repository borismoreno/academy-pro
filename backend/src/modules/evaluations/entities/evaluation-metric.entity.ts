import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Academy } from '../../academies/entities/academy.entity';

@Entity('evaluation_metrics')
export class EvaluationMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  academyId: string;

  @Column()
  metricName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Academy)
  @JoinColumn({ name: 'academy_id' })
  academy: Academy;
}
