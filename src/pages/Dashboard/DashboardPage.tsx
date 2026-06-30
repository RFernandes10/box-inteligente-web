import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { DashboardSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, TrendingDown, AlertTriangle, XCircle, DollarSign, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export function DashboardPage() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/summary');
      return data.data;
    },
  });

  const { data: movementsChart } = useQuery({
    queryKey: ['dashboard-movements'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/movements-chart');
      return data.data;
    },
  });

  const { data: lowStock } = useQuery({
    queryKey: ['dashboard-low-stock'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/low-stock');
      return data.data;
    },
  });

  const cards = [
    { title: 'Total de Produtos', value: summary?.totalProducts || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Em Estoque', value: summary?.inStock || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Estoque Baixo', value: summary?.lowStock || 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Sem Estoque', value: summary?.noStock || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Entradas Hoje', value: summary?.todayEntries || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Saídas Hoje', value: summary?.todayExits || 0, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Valor Total Estoque', value: `R$ ${(summary?.totalStockValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do estoque</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Entradas x Saídas (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={{
                labels: movementsChart?.entries?.map((e: { date: string }) => new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })) || [],
                datasets: [
                  {
                    label: 'Entradas',
                    data: movementsChart?.entries?.map((e: { total: number }) => e.total) || [],
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: 'Saídas',
                    data: movementsChart?.exits?.map((e: { total: number }) => e.total) || [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock && lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((p: Record<string, unknown>, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{String(p.name)}</p>
                      <p className="text-xs text-muted-foreground">{String(p.internalCode)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">{String(p.currentStock)} un</p>
                      <p className="text-xs text-muted-foreground">Mín: {String(p.minStock)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Nenhum produto com estoque baixo</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
