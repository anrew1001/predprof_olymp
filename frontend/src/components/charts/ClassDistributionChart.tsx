import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Bar } from 'react-chartjs-2';
import { getClassDistribution } from '../../api/client';
import type { ClassDistribution } from '../../types/api';
import {
  ChartWrapper,
  ChartPlaceholder,
  CHART_GRID_COLOR,
  CHART_BORDER_COLOR,
  CHART_TICK_COLOR,
  CHART_FONT,
  CHART_TOOLTIP,
  CHART_ZOOM,
} from './TrainingHistoryChart';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

export default function ClassDistributionChart() {
  const [dist, setDist] = useState<ClassDistribution | null>(null);
  const [error, setError] = useState(false);
  const chartRef = useRef<ChartJS<'bar'>>(null);

  useEffect(() => {
    getClassDistribution()
      .then(setDist)
      .catch(() => setError(true));
  }, []);

  const resetZoom = () => chartRef.current?.resetZoom();

  if (error || !dist) {
    return (
      <ChartPlaceholder
        title="Распределение классов"
        subtitle="количество записей по классам"
        isEmpty={error}
      />
    );
  }

  const entries = Object.entries(dist).sort((a, b) => Number(a[0]) - Number(b[0]));
  const labels = entries.map(([k]) => k);
  const values = entries.map(([, v]) => v);

  const data = {
    labels,
    datasets: [{
      label: 'Записей',
      data: values,
      backgroundColor: 'rgba(37,99,235,0.65)',
      borderColor: '#2563eb',
      borderWidth: 1,
      borderRadius: 3,
      hoverBackgroundColor: 'rgba(37,99,235,0.85)',
    }],
  };

  return (
    <ChartWrapper title="Распределение классов" subtitle="количество записей по классам" onReset={resetZoom}>
      <Bar
        ref={chartRef}
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          scales: {
            x: {
              ticks: {
                color: CHART_TICK_COLOR,
                font: { family: CHART_FONT, size: 11 },
                maxTicksLimit: 15,
                maxRotation: 45,
              },
              grid: { display: false },
              border: { color: CHART_BORDER_COLOR },
            },
            y: {
              ticks: { color: CHART_TICK_COLOR, font: { family: CHART_FONT, size: 11 } },
              grid: { color: CHART_GRID_COLOR },
              border: { color: CHART_BORDER_COLOR },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: CHART_TOOLTIP,
            zoom: CHART_ZOOM,
          },
        }}
      />
    </ChartWrapper>
  );
}
