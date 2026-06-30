import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Product, StockMovement } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, ArrowDown, ArrowUp, Package } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getUnitLabel, getWeightDisplay } from '@/utils/units';

export function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => { const { data } = await api.get(`/products/${id}`); return data.data; },
  });

  const { data: movements } = useQuery({
    queryKey: ['product-movements', id],
    queryFn: async () => { const { data } = await api.get(`/stock-movements/product/${id}?limit=10`); return data; },
  });

  if (isLoading) return <div className="animate-pulse space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-muted rounded-xl" />)}</div>;
  if (!product) return <p>Produto não encontrado</p>;

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/products"><Button variant="outline" size="icon"><ArrowLeft size={18} /></Button></Link>
          <div>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-muted-foreground">{product.internalCode}</p>
          </div>
        </div>
        {canEdit && (
          <Link to={`/products/${id}/edit`}>
            <Button><Edit className="h-4 w-4 mr-2" />Editar</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Informações do Produto</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div><p className="text-sm text-muted-foreground">Marca</p><p className="font-medium">{product.brand.name}</p></div>
              <div><p className="text-sm text-muted-foreground">Categoria</p><p className="font-medium">{product.category.name}</p></div>
              <div><p className="text-sm text-muted-foreground">Fornecedor</p><p className="font-medium">{product.supplier?.name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Unidade</p><p className="font-medium">{getUnitLabel(product.unit)}</p></div>
              <div><p className="text-sm text-muted-foreground">Peso</p><p className="font-medium">{getWeightDisplay(product.weight, product.unit)}</p></div>
              <div><p className="text-sm text-muted-foreground">Localização</p><p className="font-medium">{product.location || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Preço de Custo</p><p className="font-medium">R$ {Number(product.costPrice).toFixed(2)}</p></div>
              <div><p className="text-sm text-muted-foreground">Preço de Venda</p><p className="font-medium">R$ {Number(product.salePrice).toFixed(2)}</p></div>
              <div><p className="text-sm text-muted-foreground">Validade</p><p className="font-medium">{product.expirationDate ? new Date(product.expirationDate).toLocaleDateString('pt-BR') : '-'}</p></div>
            </div>
            {product.description && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="mt-1">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Estoque</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-xl">
              <Package className="mx-auto h-12 w-12 text-primary mb-2" />
              <p className="text-4xl font-bold">{product.currentStock}</p>
              <p className="text-sm text-muted-foreground">unidades em estoque</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Mínimo</p>
                <p className="text-xl font-bold text-orange-600">{product.minStock}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Máximo</p>
                <p className="text-xl font-bold text-blue-600">{product.maxStock || '-'}</p>
              </div>
            </div>
            {product.currentStock <= product.minStock && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
                <p className="text-sm font-medium text-red-600">⚠ Estoque abaixo do mínimo!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Histórico de Movimentações</CardTitle></CardHeader>
        <CardContent>
          {movements?.data?.length > 0 ? (
            <div className="space-y-3">
              {movements.data.map((mov: StockMovement) => (
                <div key={mov.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {mov.type === 'ENTRY' ? (
                      <div className="p-2 rounded-full bg-green-100"><ArrowDown className="h-4 w-4 text-green-600" /></div>
                    ) : (
                      <div className="p-2 rounded-full bg-red-100"><ArrowUp className="h-4 w-4 text-red-600" /></div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{mov.type === 'ENTRY' ? 'Entrada' : 'Saída'} - {mov.quantity} un</p>
                      <p className="text-xs text-muted-foreground">{mov.user.name} • {new Date(mov.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{mov.previousStock} → {mov.newStock}</p>
                    {mov.reason && <p className="text-xs text-muted-foreground">{mov.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma movimentação registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
