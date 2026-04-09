import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Academy } from '../../academies/entities/academy.entity';
import { Player } from '../../players/entities/player.entity';
import { TeamCoach } from './team-coach.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  academyId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  schedule: string;

  @Column({ nullable: true })
  field: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Academy, (academy) => academy.teams)
  @JoinColumn({ name: 'academy_id' })
  academy: Academy;

  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @OneToMany(() => TeamCoach, (tc) => tc.team)
  coaches: TeamCoach[];
}
