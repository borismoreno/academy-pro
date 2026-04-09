import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSession } from './entities/attendance-session.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceSession, AttendanceRecord])],
  exports: [TypeOrmModule],
})
export class AttendanceModule {}
