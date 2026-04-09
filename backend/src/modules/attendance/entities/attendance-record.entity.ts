import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  playerId: string;

  @Column()
  present: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => AttendanceSession, (session) => session.records)
  @JoinColumn({ name: 'session_id' })
  session: AttendanceSession;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;
}
