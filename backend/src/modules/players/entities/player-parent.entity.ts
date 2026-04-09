import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { User } from '../../users/entities/user.entity';

@Entity('player_parents')
export class PlayerParent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  relationship: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Player, (player) => player.parents)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
