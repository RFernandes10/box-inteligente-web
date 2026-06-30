export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STOCKIST';
  active: boolean;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  responsible?: string;
  active: boolean;
}

export interface Product {
  id: string;
  internalCode: string;
  barcode?: string;
  name: string;
  description?: string;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  supplier?: { id: string; name: string };
  unit: string;
  weight?: number;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  location?: string;
  expirationDate?: string;
  imageUrl?: string;
  observations?: string;
  active: boolean;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  product: { id: string; name: string; internalCode: string };
  user: { id: string; name: string };
  supplier?: { id: string; name: string };
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  previousStock: number;
  newStock: number;
  documentNumber?: string;
  reason?: string;
  destination?: string;
  observations?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  noStock: number;
  todayEntries: number;
  todayExits: number;
  totalStockValue: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}
