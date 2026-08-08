import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { StockMovement, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/stores/authStore';
import { canViewHistory } from '@/utils/roles';
import { assertValidMovement, getApiError } from '@/utils/errors';

export function StockMovementsPage() {
  const { user } = useAuthStore();
  const viewHistory = canViewHistory(user?.role);
  const [tab, setTab] = useState<'history' | 'entry' | 'exit'>(viewHistory ? 'history' : 'entry');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const debouncedSearch = useDebounce(productSearch, 300);
  const queryClient = useQueryClient();

  const { data: movements } = useQuery({
    queryKey: ['movements'],
    enabled: viewHistory,
    queryFn: async () => {
      const { data } = await api.get('/stock-movements?limit=50');
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['product-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const { data } = await api.get(`/products/search?q=${debouncedSearch}`);
      return data.data;
    },
    enabled: !!debouncedSearch,
  });

  const entryMutation = useMutation({
    mutationFn: async () => {
      const product = selectedProduct;
      if (!product) throw new Error('Selecione um produto antes de registrar a entrada');
      const qty = assertValidMovement(product, quantity);
      return api.post('/stock-movements/entry', {
        productId: product.id,
        quantity: qty,
        reason,
        documentNumber,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      toast.success('Entrada registrada!');
      resetForm();
    },
    onError: (err: unknown) => {
      toast.error(getApiError(err, 'Erro ao registrar entrada'));
    },
  });

  const exitMutation = useMutation({
    mutationFn: async () => {
      const product = selectedProduct;
      if (!product) throw new Error('Selecione um produto antes de registrar a saída');
      const qty = assertValidMovement(product, quantity);
      return api.post('/stock-movements/exit', {
        productId: product.id,
        quantity: qty,
        reason,
        documentNumber,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      toast.success('Saída registrada!');
      resetForm();
    },
    onError: (err: unknown) => {
      toast.error(getApiError(err, 'Erro ao registrar saída'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!confirm('Tem certeza que deseja limpar todo o histórico de movimentações? Esta ação não pode ser desfeita.')) {
        throw new Error('CANCELLED');
      }
      return api.delete('/stock-movements');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      toast.success('Histórico limpo!');
    },
    onError: (err: unknown) => {
      if ((err as { message?: string })?.message === 'CANCELLED') return;
      toast.error(getApiError(err, 'Erro ao limpar histórico'));
    },
  });

  const resetForm = () => { setSelectedProduct(null); setQuantity(''); setReason(''); setDocumentNumber(''); setProductSearch(''); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Movimentações de Estoque</h2>
        <p className="text-muted-foreground">Registre entradas e saídas de produtos</p>
      </div>

      <div className="flex gap-2">
        {viewHistory && (
          <Button variant={tab === 'history' ? 'default' : 'outline'} onClick={() => setTab('history')}>Histórico</Button>
        )}
        <Button variant={tab === 'entry' ? 'default' : 'outline'} onClick={() => setTab('entry')} className={tab === 'entry' ? 'bg-success text-success-foreground hover:bg-success/90' : ""}>
          <ArrowDown className="h-4 w-4 mr-2" />Entrada
        </Button>
        <Button variant={tab === 'exit' ? 'default' : 'outline'} onClick={() => setTab('exit')} className={tab === 'exit' ? 'bg-danger text-danger-foreground hover:bg-danger/90' : ""}>
          <ArrowUp className="h-4 w-4 mr-2" />Saída
        </Button>
      </div>

      {(tab === 'entry' || tab === 'exit') && (
        <Card>
          <CardHeader><CardTitle>{tab === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Produto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Nome, código interno ou código de barras..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="pl-10" />
              </div>
              {products && products.length > 0 && !selectedProduct && (
                <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                  {products.map((p: Product) => (
                    <button key={p.id} onClick={() => { setSelectedProduct(p); setProductSearch(''); }} className="w-full text-left p-3 hover:bg-muted transition-colors">
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.internalCode} • Estoque: {p.currentStock}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedProduct.internalCode} • Estoque atual: {selectedProduct.currentStock}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>Trocar</Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantidade *</label>
                <Input type="number" step="1" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Documento</label>
                <Input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="NF, etc." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo</label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo da movimentação" />
              </div>
            </div>

            <Button
              onClick={() => tab === 'entry' ? entryMutation.mutate() : exitMutation.mutate()}
              disabled={!selectedProduct || !quantity || entryMutation.isPending || exitMutation.isPending}
              className={tab === 'entry' ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-danger text-danger-foreground hover:bg-danger/90'}
            >
              {entryMutation.isPending || exitMutation.isPending ? 'Processando...' : tab === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 'history' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Histórico de Movimentações</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending || !movements?.data?.length}
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
              {deleteMutation.isPending ? 'Limpando...' : 'Limpar Histórico'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movements?.data?.map((mov: StockMovement) => (
                <div key={mov.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    {mov.type === 'ENTRY' ? (
                      <div className="p-2 rounded-full bg-success-soft"><ArrowDown className="h-4 w-4 text-success-soft-foreground" /></div>
                    ) : (
                      <div className="p-2 rounded-full bg-danger-soft"><ArrowUp className="h-4 w-4 text-danger-soft-foreground" /></div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{mov.product.name}</p>
                      <p className="text-xs text-muted-foreground">{mov.user.name} • {new Date(mov.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${mov.type === 'ENTRY' ? 'text-success' : 'text-danger'}`}>
                      {mov.type === 'ENTRY' ? '+' : '-'}{mov.quantity} un
                    </p>
                    <p className="text-xs text-muted-foreground">{mov.previousStock} → {mov.newStock}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
