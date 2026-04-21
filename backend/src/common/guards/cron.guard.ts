import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CronGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const secret = request.headers['x-cron-secret'];

    if (!secret || secret !== process.env.CRON_SECRET) {
      throw new UnauthorizedException('Acceso no autorizado');
    }

    return true;
  }
}
