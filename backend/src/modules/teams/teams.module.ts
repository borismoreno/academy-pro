import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamCoach } from './entities/team-coach.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamCoach])],
  exports: [TypeOrmModule],
})
export class TeamsModule {}
