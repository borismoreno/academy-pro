import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  SAAS_OWNER = 'saas_owner',
  ACADEMY_DIRECTOR = 'academy_director',
  COACH = 'coach',
  PARENT = 'parent',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
