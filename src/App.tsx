import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

import { LoginPage } from '@/pages/Login/LoginPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { ProductListPage } from '@/pages/Products/ProductListPage';
import { ProductFormPage } from '@/pages/Products/ProductFormPage';
import { ProductDetailPage } from '@/pages/Products/ProductDetailPage';
import { BrandsPage } from '@/pages/Brands/BrandsPage';
import { CategoriesPage } from '@/pages/Categories/CategoriesPage';
import { SuppliersPage } from '@/pages/Suppliers/SuppliersPage';
import { StockMovementsPage } from '@/pages/StockMovements/StockMovementsPage';
import { ReportsPage } from '@/pages/Reports/ReportsPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/movements" element={<StockMovementsPage />} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route index element={<ReportsPage />} />
            </Route>
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route index element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </QueryClientProvider>
  );
}
