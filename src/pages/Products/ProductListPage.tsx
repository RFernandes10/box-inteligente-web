import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Product, Pagination } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/authStore';
import { useDebounce } from '@/hooks/useDebounce';

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 300);
  const page = Number(searchParams.get('page')) || 1;
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (debouncedSearch) params.append('search', debouncedSearch);
      const { data } = await api.get(`/products?${params}`);
      return data as { data: Product[]; pagination: Pagination };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto removido com sucesso');
    },
    onError: () => toast.error('Erro ao remover produto'),
  });

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canDelete = user?.role === 'ADMIN';

  const getStockBadge = (product: Product) => {
    if (product.currentStock === 0) return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Sem Estoque</span>;
    if (product.currentStock <= product.minStock) return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">Estoque Baixo</span>;
    if (product.maxStock && product.currentStock >= product.maxStock) return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Estoque Cheio</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Normal</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Produtos</h2>
          <p className="text-muted-foreground">Gerencie os produtos do estoque</p>
        </div>
        {canEdit && (
          <Link to="/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSearchParams({ page: '1' }); }}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Produto</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Código</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Marca</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoria</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Preço</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Estoque</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">IMG</div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{product.internalCode}</td>
                        <td className="py-3 px-4 text-sm">{product.brand.name}</td>
                        <td className="py-3 px-4 text-sm">{product.category.name}</td>
                        <td className="py-3 px-4 text-sm text-right">R$ {Number(product.salePrice).toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">{product.currentStock}</td>
                        <td className="py-3 px-4 text-center">{getStockBadge(product)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/products/${product.id}`}>
                              <Button variant="ghost" size="icon"><Eye size={16} /></Button>
                            </Link>
                            {canEdit && (
                              <Link to={`/products/${product.id}/edit`}>
                                <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                              </Link>
                            )}
                            {canDelete && (
                              <Button variant="ghost" size="icon" onClick={() => { if (confirm('Remover este produto?')) deleteMutation.mutate(product.id); }}>
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(data.pagination.page - 1) * data.pagination.limit + 1} a{' '}
                    {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} de {data.pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setSearchParams({ page: String(page - 1) })}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm">{page} / {data.pagination.totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.pagination.totalPages}
                      onClick={() => setSearchParams({ page: String(page + 1) })}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
