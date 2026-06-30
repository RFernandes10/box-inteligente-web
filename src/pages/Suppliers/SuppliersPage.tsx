import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Supplier } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/authStore';

export function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', cnpj: '', email: '', phone: '', address: '', responsible: '' });
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: async () => {
      const params = search ? `?search=${search}` : '';
      const { data } = await api.get(`/suppliers${params}`);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (editingSupplier) return api.put(`/suppliers/${editingSupplier.id}`, form);
      return api.post('/suppliers', form);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Fornecedor salvo!'); resetForm(); },
    onError: () => toast.error('Erro ao salvar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Removido'); },
  });

  const resetForm = () => { setShowForm(false); setEditingSupplier(null); setForm({ name: '', cnpj: '', email: '', phone: '', address: '', responsible: '' }); };
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fornecedores</h2>
          <p className="text-muted-foreground">Gerencie os fornecedores</p>
        </div>
        {canEdit && <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Novo Fornecedor</Button>}
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingSupplier ? 'Editar' : 'Novo'} Fornecedor</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="CNPJ" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Endereço" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <Input placeholder="Responsável" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => mutation.mutate()} disabled={!form.name}>Salvar</Button>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar fornecedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.data?.map((supplier: Supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg"><Truck size={20} /></div>
                  <div>
                    <p className="font-medium">{supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{supplier.cnpj || '-'} • {supplier.phone || '-'}</p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingSupplier(supplier); setForm({ name: supplier.name, cnpj: supplier.cnpj || '', email: supplier.email || '', phone: supplier.phone || '', address: supplier.address || '', responsible: supplier.responsible || '' }); setShowForm(true); }}>
                      <Edit size={16} />
                    </Button>
                    {user?.role === 'ADMIN' && (
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Remover?')) deleteMutation.mutate(supplier.id); }}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
