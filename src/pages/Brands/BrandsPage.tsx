import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Brand } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/authStore';

export function BrandsPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['brands', search],
    queryFn: async () => {
      const params = search ? `?search=${search}` : '';
      const { data } = await api.get(`/brands${params}`);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (editingBrand) {
        return api.put(`/brands/${editingBrand.id}`, { name, description });
      }
      return api.post('/brands', { name, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(editingBrand ? 'Marca atualizada!' : 'Marca criada!');
      resetForm();
    },
    onError: () => toast.error('Erro ao salvar marca'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/brands/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['brands'] }); toast.success('Marca removida'); },
  });

  const resetForm = () => { setShowForm(false); setEditingBrand(null); setName(''); setDescription(''); };
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marcas</h2>
          <p className="text-muted-foreground">Gerencie as marcas dos produtos</p>
        </div>
        {canEdit && <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Nova Marca</Button>}
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingBrand ? 'Editar Marca' : 'Nova Marca'}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input placeholder="Nome da marca" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
              <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1" />
              <Button onClick={() => mutation.mutate()} disabled={!name}>{editingBrand ? 'Atualizar' : 'Criar'}</Button>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar marca..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((brand: Brand) => (
              <div key={brand.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{brand.name}</p>
                  {brand.description && <p className="text-sm text-muted-foreground">{brand.description}</p>}
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingBrand(brand); setName(brand.name); setDescription(brand.description || ''); setShowForm(true); }}>
                      <Edit size={16} />
                    </Button>
                    {user?.role === 'ADMIN' && (
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Remover?')) deleteMutation.mutate(brand.id); }}>
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
