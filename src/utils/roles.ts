export type UserRole = 'ADMIN' | 'MANAGER' | 'STOCKIST';

export function hasRole(role: string | undefined, ...roles: UserRole[]): boolean {
  return role ? (roles as string[]).includes(role) : false;
}

export const canEditProducts = (role?: string) => hasRole(role, 'ADMIN', 'MANAGER');
export const canDeleteProducts = (role?: string) => hasRole(role, 'ADMIN');
export const canViewHistory = (role?: string) => hasRole(role, 'ADMIN', 'MANAGER');