import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  academyId: string | null;
  role: Role | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.jwtSecret') as string,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // saas_owner has no academy context — always allow
    if (payload.role === Role.saas_owner || !payload.academyId) {
      return payload;
    }

    const subscription = await this.prisma.academySubscription.findUnique({
      where: { academyId: payload.academyId },
    });

    if (subscription?.status === SubscriptionStatus.suspended) {
      throw new ForbiddenException(
        'Tu academia está suspendida. Contacta al administrador.',
      );
    }

    if (subscription?.status === SubscriptionStatus.cancelled) {
      throw new ForbiddenException(
        'Tu academia ha sido cancelada. Contacta al administrador.',
      );
    }

    return payload;
  }
}
