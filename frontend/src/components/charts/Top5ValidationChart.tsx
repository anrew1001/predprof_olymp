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
import { getTop5Validation } from '../../api/client';
import type { Top5Validation } from '../../types/api';
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

export default function Top5ValidationChart() {
  const [top5, setTop5] = useState<Top5Validation | null>(null);
  const [error, setError] = useState(false);
  const chartRef = useRef<ChartJS<'bar'>>(null);

  useEffect(() => {
    getTop5Validation()
      .then(setTop5)
      .catch(() => setError(true));
  }, []);

  const resetZoom = () => chartRef.current?.resetZoom();

  if (error || !top5) {
    return (
      <ChartPlaceholder
        title="Топ-5 классов валидации"
        subtitle="наиболее частые классы в val set"
        isEmpty={error}
      />
    );
  }

  const entries = Object.entries(top5).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = entries.map(([k]) => `Класс ${k}`);
  const values = entries.map(([, v]) => v);

  const data = {
    labels,
    datasets: [{
      label: 'Записей',
      data: values,
      backgroundColor: 'rgba(22,163,74,0.65)',
      borderColor: '#16a34a',
      borderWidth: 1,
      borderRadius: 4,
      hoverBackgroundColor: 'rgba(22,163,74,0.85)',
    }],
  };

  return (
    <ChartWrapper title="Топ-5 классов валидации" subtitle="наиболее частые классы в val set" onReset={resetZoom}>
      <Bar
        ref={chartRef}
        data={data}
        options={{
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600 },
          scales: {
            x: {
              ticks: { color: CHART_TICK_COLOR, font: { family: CHART_FONT, size: 11 } },
              grid: { color: CHART_GRID_COLOR },
              border: { color: CHART_BORDER_COLOR },
            },
            y: {
              ticks: { color: '#374151', font: { family: CHART_FONT, size: 13 } },
              grid: { display: false },
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
