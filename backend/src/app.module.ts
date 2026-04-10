import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtGuard } from './auth/guards/jwt.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { UsersModule } from './modules/users/users.module.js';
import { AcademiesModule } from './modules/academies/academies.module.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { PlayersModule } from './modules/players/players.module.js';
import { AttendanceModule } from './modules/attendance/attendance.module.js';
import { EvaluationsModule } from './modules/evaluations/evaluations.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { InvitationsModule } from './modules/invitations/invitations.module.js';
import { FieldsModule } from './modules/fields/fields.module.js';
import { EmailModule } from './common/email/email.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AcademiesModule,
    TeamsModule,
    PlayersModule,
    AttendanceModule,
    EvaluationsModule,
    NotificationsModule,
    EmailModule,
    InvitationsModule,
    FieldsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
