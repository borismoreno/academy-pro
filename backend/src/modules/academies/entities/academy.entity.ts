import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserAcademyRole } from './user-academy-role.entity';
import { Team } from '../../teams/entities/team.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('academies')
export class Academy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserAcademyRole, (uar) => uar.academy)
  userRoles: UserAcademyRole[];

  @OneToMany(() => Team, (team) => team.academy)
  teams: Team[];

  @OneToMany(() => Player, (player) => player.academy)
  players: Player[];
}
