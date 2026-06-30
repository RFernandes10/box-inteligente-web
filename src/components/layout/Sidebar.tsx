import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Package,
  Tag,
  FolderTree,
  Truck,
  ArrowDownUp,
  FileBarChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Cookie,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'MANAGER'] },
  { label: 'Produtos', icon: Package, path: '/products', roles: ['ADMIN', 'MANAGER', 'STOCKIST'] },
  { label: 'Marcas', icon: Tag, path: '/brands', roles: ['ADMIN', 'MANAGER'] },
  { label: 'Categorias', icon: FolderTree, path: '/categories', roles: ['ADMIN', 'MANAGER'] },
  { label: 'Fornecedores', icon: Truck, path: '/suppliers', roles: ['ADMIN', 'MANAGER'] },
  { label: 'Movimentações', icon: ArrowDownUp, path: '/movements', roles: ['ADMIN', 'MANAGER', 'STOCKIST'] },
  { label: 'Relatórios', icon: FileBarChart, path: '/reports', roles: ['ADMIN', 'MANAGER'] },
  { label: 'Configurações', icon: Settings, path: '/settings', roles: ['ADMIN'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-secondary text-white transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Cookie className="h-8 w-8 text-amber-400" />
            <div>
              <h1 className="font-bold text-lg leading-tight">Box-Inteligente</h1>
              <p className="text-xs text-amber-300">Casa do Biscoito</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive ? 'bg-amber-500 text-white' : 'hover:bg-white/10 text-gray-300'
                  )}
                >
                  <Icon size={20} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        {!collapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
