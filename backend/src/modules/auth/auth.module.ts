import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('app.jwtSecret'),
        signOptions: {
          expiresIn: config.get('app.jwtExpiresIn', '7d'),
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
