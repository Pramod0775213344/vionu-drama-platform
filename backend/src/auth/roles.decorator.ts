import { SetMetadata } from '@nestjs/common';

export type Role = 'USER' | 'ADMIN';
export const RoleEnum = {
  USER: 'USER' as Role,
  ADMIN: 'ADMIN' as Role,
};

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
