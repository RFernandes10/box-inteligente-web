import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-toastify';

export function SettingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STOCKIST' as string });
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: async () => { const { data } = await api.get('/users'); return data; },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (editingUser) return api.put(`/users/${editingUser.id}`, form);
      return api.post('/users', form);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuário salvo!'); resetForm(); },
    onError: () => toast.error('Erro ao salvar'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/status`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Status atualizado'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuário removido'); },
  });

  const resetForm = () => { setShowForm(false); setEditingUser(null); setForm({ name: '', email: '', password: '', role: 'STOCKIST' }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">Gerencie usuários do sistema</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Novo Usuário</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingUser ? 'Editar' : 'Novo'} Usuário</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Gerente</option>
                <option value="STOCKIST">Estoquista</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => mutation.mutate()}>Salvar</Button>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Usuários</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.data?.map((user: User) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email} • {user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => toggleMutation.mutate(user.id)}>
                    {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setForm({ name: user.name, email: user.email, password: '', role: user.role }); setShowForm(true); }}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm('Remover?')) deleteMutation.mutate(user.id); }}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
