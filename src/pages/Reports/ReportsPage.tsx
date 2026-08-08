import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  ArrowDownUp,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/services/api';

const reports = [
  {
    id: 'movements',
    title: 'Movimentações de Estoque',
    description: 'Entradas e saídas por período',
    endpoint: '/reports/movements',
    icon: ArrowDownUp,
    color: 'text-info-soft-foreground',
    bg: 'bg-info-soft',
  },
  {
    id: 'products',
    title: 'Lista de Produtos',
    description: 'Todos os produtos cadastrados',
    endpoint: '/reports/products',
    icon: Package,
    color: 'text-success-soft-foreground',
    bg: 'bg-success-soft',
  },
  {
    id: 'low-stock',
    title: 'Estoque Baixo',
    description: 'Produtos abaixo do mínimo',
    endpoint: '/reports/low-stock',
    icon: AlertTriangle,
    color: 'text-warning-soft-foreground',
    bg: 'bg-warning-soft',
  },
];

export function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = async (endpoint: string, format: string, name: string) => {
    setDownloading(`${name}-${format}`);
    try {
      const { data: blob } = await api.get(endpoint, {
        params: { format },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Relatório baixado com sucesso!');
    } catch {
      toast.error('Erro ao baixar relatório');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <p className="text-muted-foreground">Gere relatórios em PDF, Excel ou CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${report.bg}`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{report.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => downloadReport(report.endpoint, 'pdf', report.id)}
                    disabled={downloading === `${report.id}-pdf`}
                  >
                    <FileText className="h-4 w-4 mr-2 text-danger" />
                    {downloading === `${report.id}-pdf` ? 'Gerando...' : 'Baixar PDF'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => downloadReport(report.endpoint, 'excel', report.id)}
                    disabled={downloading === `${report.id}-excel`}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-success" />
                    {downloading === `${report.id}-excel` ? 'Gerando...' : 'Baixar Excel'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => downloadReport(report.endpoint, 'csv', report.id)}
                    disabled={downloading === `${report.id}-csv`}
                  >
                    <FileDown className="h-4 w-4 mr-2 text-info" />
                    {downloading === `${report.id}-csv` ? 'Gerando...' : 'Baixar CSV'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
