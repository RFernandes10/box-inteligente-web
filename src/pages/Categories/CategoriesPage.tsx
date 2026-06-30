import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/authStore';

export function CategoriesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['categories', search],
    queryFn: async () => {
      const params = search ? `?search=${search}` : '';
      const { data } = await api.get(`/categories${params}`);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) return api.put(`/categories/${editingCategory.id}`, { name, description });
      return api.post('/categories', { name, description });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Categoria salva!'); resetForm(); },
    onError: () => toast.error('Erro ao salvar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Categoria removida'); },
  });

  const resetForm = () => { setShowForm(false); setEditingCategory(null); setName(''); setDescription(''); };
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorias</h2>
          <p className="text-muted-foreground">Gerencie as categorias dos produtos</p>
        </div>
        {canEdit && <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Nova Categoria</Button>}
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingCategory ? 'Editar' : 'Nova'} Categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
              <Input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1" />
              <Button onClick={() => mutation.mutate()} disabled={!name}>Salvar</Button>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((cat: Category) => (
              <div key={cat.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50">
                <div>
                  <p className="font-medium">{cat.name}</p>
                  {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(cat); setName(cat.name); setDescription(cat.description || ''); setShowForm(true); }}>
                      <Edit size={16} />
                    </Button>
                    {user?.role === 'ADMIN' && (
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Remover?')) deleteMutation.mutate(cat.id); }}>
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
