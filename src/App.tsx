import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RequireRole } from '@/components/layout/RequireRole';
import { PageFallback } from '@/components/layout/PageFallback';

const LoginPage = lazy(() => import('@/pages/Login/LoginPage').then((m) => ({ default: m.LoginPage })));
const ChangePasswordPage = lazy(() => import('@/pages/ChangePassword/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductListPage = lazy(() => import('@/pages/Products/ProductListPage').then((m) => ({ default: m.ProductListPage })));
const ProductFormPage = lazy(() => import('@/pages/Products/ProductFormPage').then((m) => ({ default: m.ProductFormPage })));
const ProductDetailPage = lazy(() => import('@/pages/Products/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const BrandsPage = lazy(() => import('@/pages/Brands/BrandsPage').then((m) => ({ default: m.BrandsPage })));
const CategoriesPage = lazy(() => import('@/pages/Categories/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const SuppliersPage = lazy(() => import('@/pages/Suppliers/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
const StockMovementsPage = lazy(() => import('@/pages/StockMovements/StockMovementsPage').then((m) => ({ default: m.StockMovementsPage })));
const ReportsPage = lazy(() => import('@/pages/Reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function PageLoader({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export default function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PageLoader><LoginPage /></PageLoader>} />
          <Route path="/change-password" element={<PageLoader><ChangePasswordPage /></PageLoader>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<RequireRole roles={['ADMIN', 'MANAGER']} redirectTo="/products" />}>
              <Route index element={<PageLoader><DashboardPage /></PageLoader>} />
              <Route path="/reports" element={<PageLoader><ReportsPage /></PageLoader>} />
            </Route>
            <Route path="/products" element={<PageLoader><ProductListPage /></PageLoader>} />
            <Route path="/products/:id" element={<PageLoader><ProductDetailPage /></PageLoader>} />
            <Route element={<RequireRole roles={['ADMIN', 'MANAGER']} redirectTo="/products" />}>
              <Route path="/products/new" element={<PageLoader><ProductFormPage /></PageLoader>} />
              <Route path="/products/:id/edit" element={<PageLoader><ProductFormPage /></PageLoader>} />
            </Route>
            <Route path="/brands" element={<PageLoader><BrandsPage /></PageLoader>} />
            <Route path="/categories" element={<PageLoader><CategoriesPage /></PageLoader>} />
            <Route path="/suppliers" element={<PageLoader><SuppliersPage /></PageLoader>} />
            <Route path="/movements" element={<PageLoader><StockMovementsPage /></PageLoader>} />
            <Route element={<RequireRole roles={['ADMIN']} redirectTo="/" />}>
              <Route path="/settings" element={<PageLoader><SettingsPage /></PageLoader>} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </QueryClientProvider>
  );
}