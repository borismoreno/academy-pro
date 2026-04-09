import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { appConfig } from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AcademiesModule } from './modules/academies/academies.module';
import { TeamsModule } from './modules/teams/teams.module';
import { PlayersModule } from './modules/players/players.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    UsersModule,
    AcademiesModule,
    TeamsModule,
    PlayersModule,
    AttendanceModule,
    EvaluationsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
