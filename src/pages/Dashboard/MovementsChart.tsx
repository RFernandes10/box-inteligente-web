import { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useThemeStore } from '@/stores/themeStore';

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

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hsl(triplet: string): string {
  const [h, s, l] = triplet.split(' ').map(Number);
  return `hsl(${h} ${s}% ${l}%)`;
}

function hsla(triplet: string, alpha: number): string {
  const [h, s, l] = triplet.split(' ').map(Number);
  return `hsla(${h} ${s}% ${l}% / ${alpha})`;
}

export function MovementsChart({ data }: MovementsChartProps) {
  const isDark = useThemeStore((s) => s.isDark);

  const labels =
    data?.entries?.map((e) => new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })) || [];

  const themeColors = useMemo(() => {
    return {
      grid: readVar('--chart-grid'),
      tick: readVar('--chart-tick'),
      green: readVar('--chart-green'),
      red: readVar('--chart-red'),
      tooltipBg: readVar('--muted'),
      tooltipText: readVar('--foreground'),
      tooltipBorder: readVar('--border'),
    };
    // dependência intencional: re-monta as cores quando o tema muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Entradas',
            data: data?.entries?.map((e) => e.total) || [],
            borderColor: hsl(themeColors.green),
            backgroundColor: hsla(themeColors.green, 0.1),
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Saídas',
            data: data?.exits?.map((e) => e.total) || [],
            borderColor: hsl(themeColors.red),
            backgroundColor: hsla(themeColors.red, 0.1),
            fill: true,
            tension: 0.4,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: hsl(themeColors.tick), boxWidth: 12 },
          },
          tooltip: {
            backgroundColor: hsl(themeColors.tooltipBg),
            titleColor: hsl(themeColors.tooltipText),
            bodyColor: hsl(themeColors.tooltipText),
            borderColor: hsl(themeColors.tooltipBorder),
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: hsl(themeColors.tick) },
          },
          y: {
            beginAtZero: true,
            grid: { color: hsl(themeColors.grid) },
            ticks: { color: hsl(themeColors.tick) },
          },
        },
      }}
    />
  );
}