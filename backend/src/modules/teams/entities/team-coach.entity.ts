import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';

@Entity('team_coaches')
export class TeamCoach {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teamId: string;

  @Column()
  userId: string;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Team, (team) => team.coaches)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
