import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WEIGHT_UNITS } from '@/utils/units';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  brandId: z.string().uuid('Selecione uma marca'),
  categoryId: z.string().uuid('Selecione uma categoria'),
  supplierId: z.string().uuid().optional().or(z.literal('')),
  unit: z.string().default('UN'),
  weight: z.coerce.number().optional(),
  costPrice: z.coerce.number().min(0, 'Preço de custo inválido'),
  salePrice: z.coerce.number().min(0, 'Preço de venda inválido'),
  minStock: z.coerce.number().int().min(0).default(0),
  maxStock: z.coerce.number().int().optional(),
  location: z.string().optional(),
  expirationDate: z.string().optional(),
  observations: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, control } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const watchedUnit = useWatch({ control, name: 'unit', defaultValue: 'UN' });

  const { data: brands } = useQuery({
    queryKey: ['brands-all'],
    queryFn: async () => { const { data } = await api.get('/brands/all'); return data.data; },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => { const { data } = await api.get('/categories/all'); return data.data; },
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: async () => { const { data } = await api.get('/suppliers/all'); return data.data; },
  });

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => { const { data } = await api.get(`/products/${id}`); return data.data; },
    enabled: isEditing,
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        barcode: product.barcode || '',
        description: product.description || '',
        brandId: product.brand.id,
        categoryId: product.category.id,
        supplierId: product.supplier?.id || '',
        unit: product.unit,
        weight: product.weight || undefined,
        costPrice: Number(product.costPrice),
        salePrice: Number(product.salePrice),
        minStock: product.minStock,
        maxStock: product.maxStock || undefined,
        location: product.location || '',
        expirationDate: product.expirationDate ? product.expirationDate.split('T')[0] : '',
        observations: product.observations || '',
      });
      if (product.imageUrl) setImagePreview(product.imageUrl);
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') formData.append(key, String(value));
      });
      if (imageFile) formData.append('image', imageFile);
      if (isEditing) {
        return api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      return api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(isEditing ? 'Produto atualizado!' : 'Produto criado!');
      navigate('/products');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erro ao salvar produto');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/products">
          <Button variant="outline" size="icon"><ArrowLeft size={18} /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
          <p className="text-muted-foreground">{isEditing ? 'Atualize as informações do produto' : 'Cadastre um novo produto'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input {...register('name')} placeholder="Nome do produto" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Código de Barras</Label>
                  <Input {...register('barcode')} placeholder="Código de barras" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <textarea {...register('description')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Descrição do produto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Marca *</Label>
                  <select {...register('brandId')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Selecione</option>
                    {brands?.map((b: { id: string; name: string }) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  {errors.brandId && <p className="text-xs text-red-500">{errors.brandId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <select {...register('categoryId')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Selecione</option>
                    {categories?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <select {...register('supplierId')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Selecione</option>
                    {suppliers?.map((s: { id: string; name: string }) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Imagem</CardTitle></CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-contain rounded-lg" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Arraste ou clique para enviar</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (max 5MB)</p>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Preços e Estoque</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Preço de Custo *</Label>
                <Input type="number" step="0.01" {...register('costPrice')} placeholder="0.00" />
                {errors.costPrice && <p className="text-xs text-red-500">{errors.costPrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Preço de Venda *</Label>
                <Input type="number" step="0.01" {...register('salePrice')} placeholder="0.00" />
                {errors.salePrice && <p className="text-xs text-red-500">{errors.salePrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <select {...register('unit')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="UN">Unidade</option>
                  <option value="KG">Quilograma</option>
                  <option value="CX">Caixa</option>
                  <option value="PCT">Pacote</option>
                  <option value="L">Litro</option>
                  <option value="G">Grama</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Peso ({WEIGHT_UNITS[watchedUnit] || 'kg'})</Label>
                <Input type="number" step="0.001" {...register('weight')} placeholder="0.000" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Estoque Mínimo</Label>
                <Input type="number" {...register('minStock')} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Estoque Máximo</Label>
                <Input type="number" {...register('maxStock')} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input {...register('location')} placeholder="Corredor A, Prateleira 3" />
              </div>
              <div className="space-y-2">
                <Label>Validade</Label>
                <Input type="date" {...register('expirationDate')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
          <CardContent>
            <textarea {...register('observations')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Observações adicionais sobre o produto" />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/products"><Button type="button" variant="outline">Cancelar</Button></Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Produto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
