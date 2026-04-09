import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Academy } from './academy.entity';

export enum AcademyRole {
  SAAS_OWNER = 'saas_owner',
  ACADEMY_DIRECTOR = 'academy_director',
  COACH = 'coach',
  PARENT = 'parent',
}

@Entity('user_academy_roles')
@Unique(['userId', 'academyId'])
export class UserAcademyRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  academyId: string;

  @Column({ type: 'enum', enum: AcademyRole })
  role: AcademyRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.academyRoles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Academy, (academy) => academy.userRoles)
  @JoinColumn({ name: 'academy_id' })
  academy: Academy;
}
