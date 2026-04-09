import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';
import {
  UserAcademyRole,
  AcademyRole,
} from '../../modules/academies/entities/user-academy-role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserAcademyRole)
    private userAcademyRoleRepo: Repository<UserAcademyRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const academyId = request.headers['x-academy-id'];

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // saas_owner bypass: check global role without academy context
    if (requiredRoles.includes(UserRole.SAAS_OWNER)) {
      const ownerRole = await this.userAcademyRoleRepo.findOne({
        where: { userId: user.sub, role: AcademyRole.SAAS_OWNER, isActive: true },
      });
      if (ownerRole) return true;
    }

    if (!academyId) {
      throw new ForbiddenException('Encabezado X-Academy-Id requerido');
    }

    const userRole = await this.userAcademyRoleRepo.findOne({
      where: { userId: user.sub, academyId, isActive: true },
    });

    if (!userRole) {
      throw new ForbiddenException('Acceso denegado a esta academia');
    }

    request.userAcademyRole = userRole;

    return requiredRoles.includes(userRole.role as unknown as UserRole);
  }
}
