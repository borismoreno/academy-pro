import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Academy } from '../../academies/entities/academy.entity';
import { Team } from '../../teams/entities/team.entity';
import { PlayerParent } from './player-parent.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  academyId: string;

  @Column()
  teamId: string;

  @Column()
  fullName: string;

  @Column({ type: 'date' })
  birthDate: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Academy, (academy) => academy.players)
  @JoinColumn({ name: 'academy_id' })
  academy: Academy;

  @ManyToOne(() => Team, (team) => team.players)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @OneToMany(() => PlayerParent, (pp) => pp.player)
  parents: PlayerParent[];
}
