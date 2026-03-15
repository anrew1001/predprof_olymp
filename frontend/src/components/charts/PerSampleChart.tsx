import { useRef } from 'react';
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
import type { SampleResult } from '../../types/api';
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

interface Props {
  samples: SampleResult[] | null;
}

export default function PerSampleChart({ samples }: Props) {
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const resetZoom = () => chartRef.current?.resetZoom();

  if (!samples || samples.length === 0) {
    return (
      <ChartPlaceholder
        title="Точность на тестовых данных"
        subtitle="correct / incorrect по сэмплам"
        isEmpty={false}
      />
    );
  }

  const labels = samples.map(s => `#${s.index}`);
  const correctData = samples.map(s => s.correct ? 1 : 0);
  const incorrectData = samples.map(s => s.correct ? 0 : 1);

  const data = {
    labels,
    datasets: [
      {
        label: 'Верно',
        data: correctData,
        backgroundColor: 'rgba(22,163,74,0.75)',
        borderColor: '#16a34a',
        borderWidth: 1,
        borderRadius: 2,
        stack: 'result',
      },
      {
        label: 'Неверно',
        data: incorrectData,
        backgroundColor: 'rgba(220,38,38,0.65)',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 2,
        stack: 'result',
      },
    ],
  };

  return (
    <ChartWrapper title="Точность на тестовых данных" subtitle="correct / incorrect по сэмплам" onReset={resetZoom}>
      <Bar
        ref={chartRef}
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          scales: {
            x: {
              stacked: true,
              ticks: {
                color: CHART_TICK_COLOR,
                font: { family: CHART_FONT, size: 10 },
                maxTicksLimit: 20,
              },
              grid: { display: false },
              border: { color: CHART_BORDER_COLOR },
            },
            y: {
              stacked: true,
              max: 1,
              ticks: {
                color: CHART_TICK_COLOR,
                font: { family: CHART_FONT, size: 11 },
                stepSize: 1,
              },
              grid: { color: CHART_GRID_COLOR },
              border: { color: CHART_BORDER_COLOR },
            },
          },
          plugins: {
            legend: {
              labels: { color: '#374151', font: { family: CHART_FONT, size: 12 }, boxWidth: 12, padding: 16 },
            },
            tooltip: {
              ...CHART_TOOLTIP,
              callbacks: {
                afterBody: (items) => {
                  const idx = items[0]?.dataIndex;
                  if (idx === undefined) return [];
                  const s = samples[idx];
                  return [
                    `True: ${s.true_label}`,
                    `Pred: ${s.predicted_label}`,
                    `Conf: ${(s.confidence * 100).toFixed(1)}%`,
                  ];
                },
              },
            },
            zoom: CHART_ZOOM,
          },
        }}
      />
    </ChartWrapper>
  );
}
