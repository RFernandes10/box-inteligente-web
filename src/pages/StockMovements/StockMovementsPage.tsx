import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { StockMovement, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Search, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDebounce } from '@/hooks/useDebounce';

export function StockMovementsPage() {
  const [tab, setTab] = useState<'history' | 'entry' | 'exit'>('history');
  const [search, setSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const debouncedSearch = useDebounce(productSearch, 300);
  const queryClient = useQueryClient();

  const { data: movements } = useQuery({
    queryKey: ['movements', search],
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
      if (!selectedProduct || !quantity) return;
      return api.post('/stock-movements/entry', {
        productId: selectedProduct.id,
        quantity: Number(quantity),
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
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erro ao registrar entrada');
    },
  });

  const exitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct || !quantity) return;
      return api.post('/stock-movements/exit', {
        productId: selectedProduct.id,
        quantity: Number(quantity),
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
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erro ao registrar saída');
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
        <Button variant={tab === 'history' ? 'default' : 'outline'} onClick={() => setTab('history')}>Histórico</Button>
        <Button variant={tab === 'entry' ? 'default' : 'outline'} onClick={() => setTab('entry')} className="bg-green-600 hover:bg-green-700">
          <ArrowDown className="h-4 w-4 mr-2" />Entrada
        </Button>
        <Button variant={tab === 'exit' ? 'default' : 'outline'} onClick={() => setTab('exit')} className="bg-red-600 hover:bg-red-700">
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
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
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
              className={tab === 'entry' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {entryMutation.isPending || exitMutation.isPending ? 'Processando...' : tab === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movements?.data?.map((mov: StockMovement) => (
                <div key={mov.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    {mov.type === 'ENTRY' ? (
                      <div className="p-2 rounded-full bg-green-100"><ArrowDown className="h-4 w-4 text-green-600" /></div>
                    ) : (
                      <div className="p-2 rounded-full bg-red-100"><ArrowUp className="h-4 w-4 text-red-600" /></div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{mov.product.name}</p>
                      <p className="text-xs text-muted-foreground">{mov.user.name} • {new Date(mov.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${mov.type === 'ENTRY' ? 'text-green-600' : 'text-red-600'}`}>
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
