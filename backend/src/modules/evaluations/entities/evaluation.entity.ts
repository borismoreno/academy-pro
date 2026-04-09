import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { User } from '../../users/entities/user.entity';
import { EvaluationScore } from './evaluation-score.entity';

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column()
  coachId: string;

  @Column({ type: 'date' })
  evaluatedAt: string;

  @Column({ type: 'text', nullable: true })
  coachNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'coach_id' })
  coach: User;

  @OneToMany(() => EvaluationScore, (score) => score.evaluation)
  scores: EvaluationScore[];
}
