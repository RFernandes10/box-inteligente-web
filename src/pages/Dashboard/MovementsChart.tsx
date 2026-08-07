import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ChartPoint {
  date: string;
  total: number;
}

interface MovementsChartData {
  entries: ChartPoint[];
  exits: ChartPoint[];
}

interface MovementsChartProps {
  data?: MovementsChartData;
}

export function MovementsChart({ data }: MovementsChartProps) {
  const labels = data?.entries?.map((e) => new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })) || [];

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Entradas',
            data: data?.entries?.map((e) => e.total) || [],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Saídas',
            data: data?.exits?.map((e) => e.total) || [],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } },
      }}
    />
  );
}