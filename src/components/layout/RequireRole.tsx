import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/utils/roles';

interface RequireRoleProps {
  roles: UserRole[];
  redirectTo?: string;
}

export function RequireRole({ roles, redirectTo = '/' }: RequireRoleProps) {
  const { user } = useAuthStore();

  if (user && !roles.includes(user.role as UserRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}